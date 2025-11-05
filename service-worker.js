// Minimal service worker - no caching to avoid refresh issues
const CACHE_NAME = 'portfolio-v1';

// Install event - just activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event - clean up and take control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - always network first, no aggressive caching
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

