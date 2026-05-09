// public/sw.js — Custom service worker
// Handles Web Push notifications. vite-plugin-pwa (injectManifest strategy)
// will inject the precache manifest into this file at build time.

// --- Precache injection point (populated by vite-plugin-pwa at build time) ---
// eslint-disable-next-line no-undef
self.__WB_MANIFEST

// ── Push notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: event.data.text(), body: '' }
  }

  const { title, body, payload } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body ?? '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: payload?.kind ?? 'general',
      data: payload ?? {},
      vibrate: [100, 50, 100],
    })
  )
})

// ── Notification click → open relevant page ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Reuse existing tab if open
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        return clients.openWindow(url)
      })
  )
})
