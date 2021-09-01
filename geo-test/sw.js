self.addEventListener('install', (e) => {
        e.waitUntil(
                caches.open('geo-test').then((cache) => cache.addAll([
                        'index.html',
                        'geo-test.js',
                        'img/Globe.png',
                ])),
                );
        });

//self.addEventListener('fetch', (e) => {
//        e.respondWith(
//                caches.match(e.request).then((response) => response || fetch(e.request)),
//                );
//        });
//

//self.addEventListener('fetch', function(e) {e.respondWith(caches.open('geo-test').then(function(cache) {return fetch(e.request).then(function(response) {cache.put(e.request, response.clone());return response;});}));});

self.addEventListener('fetch', (e)=>{e.respondWith(caches.open('geo-test').then((cache)=>{fetch(e.request).then((response)=>{cache.put(e.request, response.clone());response;});}));});
