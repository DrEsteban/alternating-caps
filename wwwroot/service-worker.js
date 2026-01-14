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
  `${APP_BASE}index.html`;

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

  const responsePromise = caches.match(event.request).then((cachedResponse) => {
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponsePromise = fetch(event.request).catch((error) => {
      console.error('Fetch failed for request:', event.request.url, error);
      return undefined;
    });

    event.waitUntil(
      networkResponsePromise.then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const responseClone = response.clone();
          return caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
        }
        return undefined;
      })
    );

    return networkResponsePromise;
  });

  event.respondWith(
    responsePromise.then(async (response) => {
      if (!response) {
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match(INDEX_CACHE_PATH);
          if (fallback) {
            return fallback;
          }
        }

        return new Response('Offline', {
          status: 503,
          statusText: 'Offline'
        });
      }

      return response;
    })
  );
});
