const CACHE_NAME = 'spendline-shell-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
]

async function precacheBuildAssets() {
  const cache = await caches.open(CACHE_NAME)
  const response = await fetch('/index.html', { cache: 'no-cache' })
  if (!response.ok) return
  await cache.put('/index.html', response.clone())

  const html = await response.text()
  const assetUrls = new Set()
  const htmlAssetPattern = /(?:src|href)="(\/assets\/[^"]+)"/g
  for (const match of html.matchAll(htmlAssetPattern)) {
    assetUrls.add(match[1])
  }

  // Vite fingerprints CSS, and the font files live inside those stylesheets.
  // Pull those references in too so the first offline visit still has typography.
  const cssUrls = [...assetUrls].filter((url) => url.endsWith('.css'))
  await Promise.all(
    cssUrls.map(async (cssUrl) => {
      try {
        const cssResponse = await fetch(cssUrl)
        if (!cssResponse.ok) return
        const css = await cssResponse.text()
        const urlPattern = /url\((?:'|")?([^)'"]+)(?:'|")?\)/g
        for (const match of css.matchAll(urlPattern)) {
          const value = match[1]
          if (value.startsWith('/')) assetUrls.add(value)
        }
      } catch {
        // Runtime caching will pick this up on the next online visit.
      }
    }),
  )

  await Promise.all(
    [...assetUrls].map(async (url) => {
      try {
        await cache.add(url)
      } catch {
        // A single missing optional asset should not block installation.
      }
    }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            await cache.add(url)
          } catch {
            // Keep installing even if a non-essential shell asset is missing.
          }
        }),
      )
      await precacheBuildAssets()
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match('/index.html')
          return cached ?? new Response('Offline', { status: 503 })
        }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)

      return cached ?? network
    }),
  )
})
