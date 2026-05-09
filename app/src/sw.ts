/// <reference lib="webworker" />
/// <reference types="vite-plugin-pwa/info" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// Inject precache manifest (populated by vite-plugin-pwa at build time)
precacheAndRoute(self.__WB_MANIFEST)

// ── Push notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let data: { title?: string; body?: string; payload?: Record<string, unknown> }
  try {
    data = event.data.json() as typeof data
  } catch {
    data = { title: event.data.text() }
  }

  const { title = 'Examine It Yourself', body = '', payload = {} } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: (payload['kind'] as string | undefined) ?? 'general',
      data: payload,
    })
  )
})

// ── Notification click → navigate to relevant URL ──────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return (client as WindowClient).focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
