/**
 * Handlers de notificación del cronómetro de estudio.
 * Importado por el SW generado (Workbox / vite-plugin-pwa).
 */
/* eslint-disable no-undef */
const STUDY_TAG = 'study-session'

self.addEventListener('notificationclick', (event) => {
  const note = event.notification
  if (!note || note.tag !== STUDY_TAG) return

  const action = event.action || 'open'
  /* No cerrar en open: la notificación sigue mientras haya sesión. */
  if (action === 'pause' || action === 'resume' || action === 'stop') {
    note.close()
  }

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      const payload = { type: 'STUDY_SESSION_ACTION', action }

      for (const client of all) {
        try {
          client.postMessage(payload)
        } catch {
          /* ignore */
        }
        if ('focus' in client) {
          try {
            await client.focus()
          } catch {
            /* ignore */
          }
        }
        return
      }

      const base =
        typeof self.registration === 'object' && self.registration.scope
          ? self.registration.scope
          : './'
      const url = new URL(base)
      url.searchParams.set('studyAction', action)
      await self.clients.openWindow(url.href)
    })(),
  )
})

self.addEventListener('notificationclose', (event) => {
  if (event.notification?.tag !== STUDY_TAG) return
  /* Si el usuario descarta la notificación, no paramos la sesión sola. */
})
