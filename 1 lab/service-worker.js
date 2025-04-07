const CACHE_NAME = "student-cms-v1";
const urlsToCache = [
    "/",
    "/students.html",
    "/style.css",
    "/main.js",
    "/Students.jpeg",
    "/avatar192.jpg",
    "/avatar512.jpg",
    "/avatar1.jpg",
    "/avatar2.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.log("Cache addAll failed:", err))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(err => console.log("Fetch failed:", err))
    );
});

self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});