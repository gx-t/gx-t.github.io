self.addEventListener('install', (e) => {
        e.waitUntil(
                caches.open('geo-test').then((cache) => cache.addAll([
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
