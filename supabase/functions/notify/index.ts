// supabase/functions/notify/index.ts
// Supabase Edge Function — sends Web Push + inserts notification rows.
// Triggered via Supabase DB webhook or called directly with service role key.
//
// Env vars required:
//   SUPABASE_URL              (auto-injected by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase)
//   VAPID_SUBJECT             e.g. "mailto:admin@yourdomain.com"
//   VAPID_PUBLIC_KEY          generated with: npx web-push generate-vapid-keys
//   VAPID_PRIVATE_KEY         (keep secret — never expose to browser)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NotifyPayload {
  event: 'new_article' | 'new_comment' | 'proposal_status' | 'role_change'
  title: string
  body?: string
  url?: string
  /** For targeted events: the user(s) to notify */
  user_ids?: string[]
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload: NotifyPayload = await req.json()

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Determine target user IDs
  let userIds: string[] = payload.user_ids ?? []

  if (payload.event === 'new_article' && userIds.length === 0) {
    // Broadcast to all subscribed users
    const { data } = await supabase
      .from('push_subscriptions')
      .select('user_id')
    userIds = [...new Set((data ?? []).map((r: { user_id: string }) => r.user_id))]
  }

  if (userIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Insert in-app notifications
  const { error: notifError } = await supabase.from('notifications').insert(
    userIds.map((uid) => ({
      user_id: uid,
      kind: payload.event,
      title: payload.title,
      body: payload.body ?? null,
      payload: { url: payload.url ?? null },
    }))
  )
  if (notifError) console.error('notifications insert error', notifError)

  // Fetch push subscriptions for these users
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .in('user_id', userIds)

  // Send Web Push to each subscription
  // NOTE: Real VAPID-signed push requires a Web Push library (e.g. webpush-webcrypto).
  // The implementation below is a placeholder — wire in your preferred library here.
  // See: https://github.com/nicktindall/cyclic-webpush for a Deno-compatible option.
  let pushSent = 0
  for (const row of subs ?? []) {
    try {
      const sub = row.subscription as { endpoint: string; keys: { auth: string; p256dh: string } }
      // TODO: replace with actual VAPID-signed Web Push call
      console.log(`[notify] Would push to endpoint: ${sub.endpoint.slice(0, 60)}…`)
      pushSent++
    } catch (err) {
      console.error('[notify] push error', err)
    }
  }

  return new Response(JSON.stringify({ notified: userIds.length, pushSent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
