/* EQI service worker — app-shell caching for offline use.
   All app data is in-memory mock data, so caching the shell + assets
   makes the app fully functional offline after the first visit. */
const CACHE = 'eqi-v5';
const BASE = new URL('./', self.registration.scope).pathname;
const CORE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}favicon.svg`,
  `${BASE}ud-athletics-logo-white.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // SPA navigations: network first, fall back to cached shell for offline deep links.
  // `cache: 'no-store'` is required — GitHub Pages serves index.html with
  // `Cache-Control: max-age=600`, so a plain fetch() can be silently satisfied
  // from the browser's own HTTP cache for up to 10 minutes after a deploy,
  // even though this handler is "network first" from the service worker's
  // point of view.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(`${BASE}index.html`, copy));
          return res;
        })
        .catch(() => caches.match(`${BASE}index.html`))
    );
    return;
  }

  // Static assets (own bundles + Google Fonts).
  const url = new URL(request.url);
  const cacheable = url.origin === self.location.origin
    || url.hostname === 'fonts.googleapis.com'
    || url.hostname === 'fonts.gstatic.com';
  if (!cacheable) return;

  function cacheResponse(res) {
    if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
      caches.open(CACHE).then((cache) => cache.put(request, res.clone()));
    }
    return res;
  }

  // Vite's own JS/CSS bundles are content-hashed (a new build gets a new
  // filename), so a cached one is never stale — cache first is safe and fast.
  if (/-[A-Za-z0-9_-]{6,}\.(js|css)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then(cacheResponse))
    );
    return;
  }

  // Everything else at a stable URL (logo, favicon, manifest, fonts) can change
  // without its filename changing, so serve the cached copy immediately but
  // always refetch in the background to keep the next load current — rather
  // than caching it once and never updating it again.
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request, { cache: 'no-store' }).then(cacheResponse).catch(() => cached);
      return cached || refresh;
    })
  );
});
