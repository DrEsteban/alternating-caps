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

  const cachedResponsePromise = caches.match(event.request);
  const networkResponsePromise = fetch(event.request).catch(() => undefined);

  event.respondWith(
    cachedResponsePromise.then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return networkResponsePromise.then(
        (networkResponse) =>
          networkResponse || caches.match(`${APP_BASE}index.html`)
      );
    })
  );

  event.waitUntil(
    Promise.all([cachedResponsePromise, networkResponsePromise]).then(
      ([cachedResponse, networkResponse]) => {
        if (
          !cachedResponse &&
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          return caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return undefined;
      }
    )
  );
});
