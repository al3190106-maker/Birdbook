const CACHE_NAME = 'birdfinder-v4.4.0-naturboken';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './birds.js',
    './sweden-map.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './assets/vendor/fontawesome/css/all.min.css',
    './assets/vendor/fonts/outfit/index.css',
    './assets/vendor/leaflet/leaflet.css',
    './assets/vendor/leaflet/leaflet.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Strategy: Network First, falling back to Cache
    event.respondWith(
        fetch(event.request).then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
                .then((cache) => {
                    cache.put(event.request, responseToCache);
                });

            return response;
        }).catch(() => {
            // If network fails, try cache
            return caches.match(event.request);
        })
    );
});
