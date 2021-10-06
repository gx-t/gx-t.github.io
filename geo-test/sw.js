var cache_name = "geo-test-v0.013";

self.addEventListener('install', (e) => {
        e.waitUntil(
                caches.open(cache_name).then((cache) => cache.addAll([
                        'index.html',
                        'geo-test.js',
                        'img/Globe.png',
                ])),
                );
        });

self.addEventListener('fetch', (e) => {
        console.log(e.request.url);
        e.respondWith(
                caches.match(e.request).then((response) => response || fetch(e.request)),
                );
        });

self.addEventListener('activate', (e) => {
        console.log("*** activate ***");
        e.waitUntil(caches.keys().then((key_list) => {
                    Promise.all(key_list.map((key) => {
                                if(key === cache_name) {
                                console.log("not deleting: " + key);
                                return;
                                }
                                console.log("deleting: " + key);
                                caches.delete(key);
                                }))
                    }));
        });

