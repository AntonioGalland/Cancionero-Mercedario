// Service Worker para funcionamiento Offline del Cancionero Mercedario
const CACHE_NAME = 'cancionero-mercedario-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './canciones_data.js',
  './canciones.json',
  './manifest.json',
  './Escudo Mercedario.png',
  './La Merced - Mendoza.jpeg',
  './Procesión.jpeg',
  './Virgen de la Merced - Corrientes.jpg',
  './Virgen de la Merced - Tucuman.webp',
  './Virgen de la Merced - Vitral.jpeg',
  './Virgen_de_la_Merced imagenes y vitral Parroquia San Pedro Nolasco Tucuman.jpg',
  './Virgen_de_la_Merced imagenes y vitral Parroquia de Palmares.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // En caso de fallo de red en navegación, devolver index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

