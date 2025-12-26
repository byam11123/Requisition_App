const CACHE_NAME = 'requisition-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for API calls
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Return fallback JSON if offline? Or just let standard error handling work?
                    // For now, let axios fail so we can queue in IndexedDB
                    return Promise.reject('Offline');
                })
        );
        return;
    }

    // Stale-while-revalidate for static assets
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                const fetchPromise = fetch(event.request).then(
                    (networkResponse) => {
                        // Update cache
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            // Check if valid to cache
                        }
                        return networkResponse;
                    }
                );
                return response || fetchPromise;
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
