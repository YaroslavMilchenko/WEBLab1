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
    "/avatar2.jpg",
    "/tasks.html",
    "/tasks.css",
    "/tasks.js"
];

self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Service Worker: Caching files:", urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error("Service Worker: Cache addAll failed:", err);
                throw err; // Кидаємо помилку, щоб легше діагностувати
            })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Якщо ресурс є в кеші, повертаємо його
                if (response) {
                    console.log("Service Worker: Found in cache:", event.request.url);
                    return response;
                }
                // Якщо ресурсу немає в кеші, робимо запит до мережі
                console.log("Service Worker: Fetching from network:", event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Кешуємо новий ресурс для майбутнього використання
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
                        // Якщо запит не вдався (наприклад, офлайн), можна повернути запасний ресурс
                        if (event.request.url.endsWith(".html")) {
                            return caches.match("/index.html");
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