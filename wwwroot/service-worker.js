const CACHE_NAME = 'alternating-caps-cache-v1';
const APP_BASE = self.location.pathname.replace(/service-worker\.js$/, '');
const ASSETS_TO_CACHE = [
  APP_BASE,
  `${APP_BASE}index.html`,
  `${APP_BASE}style.css`,
  `${APP_BASE}script.js`,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}favicon.ico`,
  `${APP_BASE}icon-192.png`,
  `${APP_BASE}icon-512.png`
];
const CACHE_PATHS = ASSETS_TO_CACHE.map(
  (asset) => new URL(asset, self.location.origin).pathname
);
const INDEX_CACHE_PATH =
  CACHE_PATHS.find((path) => path.endsWith('index.html')) ||
  new URL(`${APP_BASE}index.html`, self.location.origin).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const shouldHandleRequest =
    event.request.mode === 'navigate' ||
    CACHE_PATHS.includes(url.pathname);

  if (!shouldHandleRequest) {
    return;
  }

  const responsePromise = (async () => {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    let networkResponse = null;
    try {
      networkResponse = await fetch(event.request);
    } catch (error) {
      console.error('Fetch failed for request:', event.request.url, error);
      networkResponse = null;
    }

    if (
      networkResponse &&
      networkResponse.status === 200 &&
      networkResponse.type === 'basic'
    ) {
      const responseClone = networkResponse.clone();
      event.waitUntil(
        (async () => {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseClone);
        })()
      );
    }

    if (networkResponse) {
      return networkResponse;
    }

    if (event.request.mode === 'navigate') {
      const fallback = await caches.match(INDEX_CACHE_PATH);
      if (fallback) {
        return fallback;
      }
    }

    return new Response('This content is not available offline.', {
      status: 503,
      statusText: 'Offline'
    });
  })();

  event.respondWith(responsePromise);
});
