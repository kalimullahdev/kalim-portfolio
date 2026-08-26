const CACHE_NAME = 'kalim-portfolio-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './kalim-portfolio-single.html',
  './css/variables.css',
  './css/main.css',
  './css/components.css',
  './css/responsive.css',
  './js/data.js',
  './js/sound.js',
  './js/canvas.js',
  './js/terminal.js',
  './js/command-palette.js',
  './js/app.js',
  './favicon.svg',
  './assets/images/kalim-avatar.jpg',
  './assets/images/project-unichatai.jpg',
  './assets/images/project-kinetix.jpg',
  './assets/images/project-flavordash.jpg',
  './assets/images/project-pulsechat.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
