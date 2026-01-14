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

  const responsePromise = caches.match(event.request).then((cachedResponse) => {
    if (cachedResponse) {
      return { response: cachedResponse, fromCache: true };
    }

    return fetch(event.request)
      .then((networkResponse) => ({
        response: networkResponse,
        fromCache: false
      }))
      .catch(() => ({ response: undefined, fromCache: false }));
  });

  event.respondWith(
    responsePromise.then(({ response }) => {
      if (!response && event.request.mode === 'navigate') {
        return caches.match(`${APP_BASE}index.html`);
      }

      return response;
    })
  );

  event.waitUntil(
    responsePromise.then(({ response, fromCache }) => {
      if (
        !fromCache &&
        response &&
        response.status === 200 &&
        response.type === 'basic'
      ) {
        return caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, response.clone()));
      }
      return undefined;
    })
  );
});
