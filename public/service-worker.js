const CACHE_NAME = 'sleep-sounds-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';

// IMPORTANT:
// Service workers and Next.js dev/HMR are a bad mix. If a SW is installed while
// developing, it can produce confusing failures (stale chunks, broken reloads,
// and lots of "Failed to fetch" noise) because the dev server changes asset URLs
// constantly.
//
// In dev/localhost we effectively disable the SW and attempt to unregister it.
const IS_LOCALHOST = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/manifest.json',
  '/offline.html',
  '/sounds/babbling-brook.mp3',
  '/sounds/blizzard.mp3',
  '/sounds/calm-waves-beach.mp3',
  '/sounds/cat-purring.mp3',
  '/sounds/coffee-shop.mp3',
  '/sounds/crashing-waves.mp3',
  '/sounds/crickets.mp3',
  '/sounds/deep-ocean.mp3',
  '/sounds/distant-seagulls.mp3',
  '/sounds/distant-thunder.mp3',
  '/sounds/fireplace.mp3',
  '/sounds/gentle-rain.mp3',
  '/sounds/gentle-river.mp3',
  '/sounds/gentle-waves.mp3',
  '/sounds/grandfather-clock.mp3',
  '/sounds/heavy-downpour.mp3',
  '/sounds/large-waterfall.mp3',
  '/sounds/light-drizzle.mp3',
  '/sounds/owl-hooting.mp3',
  '/sounds/rain-tent.mp3',
  '/sounds/rain-tin-roof.mp3',
  '/sounds/rain-window.mp3',
  '/sounds/rolling-thunder.mp3',
  '/sounds/small-campfire.mp3',
  '/sounds/small-stream.mp3',
  '/sounds/swamp-night.mp3',
  '/sounds/temperate-forest.mp3',
  '/sounds/whale-song.mp3',
  '/sounds/wind-pines.mp3',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  if (IS_LOCALHOST) {
    // No precaching in dev; we want to get out of the way.
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  if (IS_LOCALHOST) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .catch(() => undefined)
    );
    return;
  }
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // In dev/localhost: always just go to the network.
  if (IS_LOCALHOST) {
    event.respondWith(fetch(request));
    return;
  }

  // Never try to handle/cach e non-GET requests (Next.js App Router uses POST for RSC/navigation).
  // If we touch these, navigation can hang and Chrome will throw:
  // "Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported".
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 504, statusText: 'Offline' }))
    );
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Never cache navigations / HTML documents.
  // Caching route HTML is a common cause of "looks fine → idle → broken layout"
  // because old HTML can reference old hashed /_next/static chunks after a deploy.
  // Instead: network-first *without* caching; if offline, fall back to whatever is cached.
  const accept = request.headers.get('accept') || '';
  const isNavigation = request.mode === 'navigate' || accept.includes('text/html');
  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((res) => res || caches.match('/offline.html')))
    );
    return;
  }

  // Never cache Next.js internals (can cause stale chunks / broken navigation)
  if (url.pathname.startsWith('/_next/')) {
    // Do not cache Next.js build artifacts; just avoid unhandled rejections.
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 504, statusText: 'Offline' }))
    );
    return;
  }

  // Cache-first strategy for images and audio
  if (request.destination === 'image' || request.url.includes('/sounds/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // Everything else: avoid caching to reduce the chance of stale HTML/JSON causing
  // client-side chunk mismatches or "half-loaded" UI states after sleep/resume.
  // We still provide an offline fallback if a matching cached asset exists.
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
