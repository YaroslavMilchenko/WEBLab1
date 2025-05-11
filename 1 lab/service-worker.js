const CACHE_NAME = "student-cms-v1";
const urlsToCache = [
    "/students.html",
    "/style.css",
    "/main.js",
    "/manifest.json",
    "/Students.jpeg",
    "/avatar192.png",
    "/avatar512.png",
    "/screenshot-wide.png",
    "/screenshot-narrow.png",
    "/avatar1.jpg",
    "/avatar2.jpg",
    "/tasks.html",
    "/tasks.css",
    "/tasks.js",
    "/student.php"
];

self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Service Worker: Caching files:", urlsToCache);
                const cachePromises = urlsToCache.map(url => {
                    return fetch(url, { cache: "no-store" }) // Додаємо cache: "no-store" для уникнення кешу браузера
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                            }
                            console.log(`Service Worker: Successfully cached ${url}`);
                            return cache.put(url, response);
                        })
                        .catch(err => {
                            console.error(`Service Worker: Failed to cache ${url}:`, err);
                            return null; // Продовжуємо кешування інших файлів
                        });
                });
                return Promise.all(cachePromises);
            })
            .catch(err => {
                console.error("Service Worker: Cache failed:", err);
            })
    );
});

self.addEventListener("fetch", event => {
    // Пропускаємо WebSocket-запити
    if (event.request.url.startsWith("ws://") || event.request.url.startsWith("wss://")) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log("Service Worker: Found in cache:", event.request.url);
                    return response;
                }
                console.log("Service Worker: Fetching from network:", event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch(err => {
                        console.error("Service Worker: Fetch failed:", err);
                        if (event.request.url.endsWith(".html")) {
                            return caches.match("/students.html");
                        }
                        throw err;
                    });
            })
    );
});

self.addEventListener("activate", event => {
    console.log("Service Worker: Activating...");
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log("Service Worker: Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});