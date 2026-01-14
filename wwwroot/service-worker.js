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

  let servedFromCache = false;

  const responsePromise = caches.match(event.request).then((cachedResponse) => {
    if (cachedResponse) {
      servedFromCache = true;
      return cachedResponse;
    }

    return fetch(event.request).catch((error) => {
      console.error('Fetch failed for request:', event.request.url, error);
      return undefined;
    });
  });

  const cacheUpdatePromise = responsePromise.then((response) => {
    if (
      !servedFromCache &&
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
  });

  event.waitUntil(cacheUpdatePromise);

  event.respondWith(
    responsePromise.then((response) => {
      if (!response && event.request.mode === 'navigate') {
        return caches.match(INDEX_CACHE_PATH);
      }

      return response || Response.error();
    })
  );
});
