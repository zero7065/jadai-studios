/**
 * Jadai Studios - PWA Service Worker
 * Version: jadai-v2
 * Non-negotiable: explicit CACHE_VERSION, safe invalidation, no stuck caching.
 */

const CACHE_VERSION = 'jadai-v2';
const STATIC_CACHE = `jadai-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `jadai-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass cache if query param ?nocache=1 or method is not GET
  if (request.method !== 'GET' || url.searchParams.get('nocache') === '1') {
    return;
  }

  // 1. Network-first for API routes and Supabase calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network unavailable', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Cache-first for fonts, images, scripts, static assets
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Stale-while-revalidate for page navigations / HTML
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse || caches.match('/offline') || new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8"/>
              <title>Jadai Studios — Offline</title>
              <style>
                body { background: #050404; color: #c4c0bb; font-family: serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .sigil { color: #C9A84C; font-size: 2.5rem; margin-bottom: 1rem; }
                h1 { color: #f5f3f0; font-family: monospace; letter-spacing: 0.1em; }
                p { color: #8a6e2a; font-family: monospace; font-size: 0.9rem; }
              </style>
            </head>
            <body>
              <div>
                <div class="sigil">◈</div>
                <h1>JADAI STUDIOS</h1>
                <p>BUILD DIFFERENT • OFFLINE CACHE ENGAGED</p>
                <p style="color: #4a4744; margin-top: 1rem;">Reconnect to sync with the floor.</p>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
      return cachedResponse || fetchPromise;
    })
  );
});

// Open the configured target URL when an admin broadcast notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = typeof data.url === 'string' && data.url.startsWith('http') ? data.url : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
