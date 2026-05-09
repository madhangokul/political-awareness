import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

/** Converts a VAPID public key from base64url to Uint8Array for the Push API */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Subscribes the current user to Web Push on login.
 * Silently does nothing if:
 *   - User is not logged in
 *   - Browser doesn't support service workers / Push API
 *   - VITE_VAPID_PUBLIC_KEY is not set
 */
export function usePushSubscription() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    if (!VAPID_PUBLIC_KEY) return
    if (!('serviceWorker' in navigator)) return
    if (!('PushManager' in window)) return

    async function subscribe() {
      const reg = await navigator.serviceWorker.ready

      // Check if already subscribed
      const existing = await reg.pushManager.getSubscription()
      if (existing) return

      // Request permission (no-op if already granted)
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast needed: TypeScript 5 tightened Uint8Array buffer types vs. Push API expectations
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as unknown as ArrayBuffer,
      })

      // Store in DB (insert; if endpoint already exists for user, the DB unique constraint
      // will reject the duplicate — that's fine, we catch and ignore below)
      await supabase
        .from('push_subscriptions')
        .insert({ user_id: user!.id, subscription: sub.toJSON() as object })
    }

    subscribe().catch((err) => {
      // Non-fatal — push is an enhancement
      console.warn('[push] subscription failed:', err)
    })
  }, [user])
}
