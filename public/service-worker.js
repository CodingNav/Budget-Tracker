const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/js/db.js",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
    "/manifest.webmanifest",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", (e) => {
    // pre cache all static assets
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
});

// activate
self.addEventListener("activate", (e) => {
    // takes control of client and removes old cache
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// fetch
self.addEventListener("fetch", (e) => {
    // cache successful request to the API
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    e.respondWith(
        cache.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
