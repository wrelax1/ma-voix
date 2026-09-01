const CACHE_NAME = "ma-voix-v23";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


self.addEventListener("install", function(event) {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(function(cache) {

                const requests =
                    FILES_TO_CACHE.map(function(url) {

                        return new Request(
                            url,
                            {
                                cache: "reload"
                            }
                        );

                    });

                return cache.addAll(requests);

            })
            .then(function() {

                return self.skipWaiting();

            })

    );

});


self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches
            .keys()
            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(function(cacheName) {

                        if (cacheName !== CACHE_NAME) {

                            return caches.delete(cacheName);

                        }

                    })

                );

            })
            .then(function() {

                return self.clients.claim();

            })

    );

});


self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches
            .match(event.request)
            .then(function(cachedResponse) {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);

            })

    );

});