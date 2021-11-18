const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/style.css",
    "/assets/js/index.js",
    "/assets/images/icon-192x192.png",
    "/assets/images/icon-512x512.png",
    "/manifest.webmanifest"
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

// fetch