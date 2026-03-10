const CACHE_VERSION = 'v2';
const CACHE_NAME = `hospital-app-${CACHE_VERSION}`;

// Get the base path from the service worker's own URL
const getBasePath = () => {
  const swUrl = new URL(self.location.href);
  const basePath = swUrl.pathname.substring(0, swUrl.pathname.lastIndexOf('/') + 1);
  return basePath;
};

const BASE_PATH = getBasePath();

// Core app shell assets to cache (relative to base path)
const CORE_ASSETS = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}assets/generated/pwa-icon.dim_192x192.png`,
  `${BASE_PATH}assets/generated/pwa-icon.dim_512x512.png`,
  `${BASE_PATH}assets/generated/pwa-icon-maskable.dim_512x512.png`,
  `${BASE_PATH}assets/generated/apple-touch-icon.dim_180x180.png`,
  `${BASE_PATH}assets/generated/favicon.dim_32x32.png`
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      console.log('[Service Worker] Installed successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[Service Worker] Installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {
            // Network fetch failed, but we have cache
          })
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        
        // If requesting an HTML page and offline, return cached index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match(`${BASE_PATH}index.html`);
        }
        
        throw error;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
