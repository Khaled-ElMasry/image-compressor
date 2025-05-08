self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('clipcompress-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js',
        '/manifest.json',
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
