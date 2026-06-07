// =============================================
// PAREFFI STORE — Service Worker
// PWA: Cache, Offline Support
// =============================================

const CACHE_NAME    = 'pareffi-v1.0';
const OFFLINE_URL   = './index.html';

// File yang di-cache saat install
const STATIC_ASSETS = [
  './',
  './index.html',
  './store.html',
  './cart.html',
  './artikel.html',
  './login.html',
  './register.html',
  './profile.html',
  './chat.html',
  './checkout.html',
  './manifest.json',
  './Css/index.css',
  './Css/store.css',
  './Css/cart.css',
  './Css/checkout.css',
  './Css/login.css',
  './Css/register.css',
  './Css/El.css',
  // FontAwesome CDN
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
];

// ==============================
// INSTALL — cache static assets
// ==============================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      // Cache satu per satu agar error satu tidak gagalkan semua
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(e => console.warn('[SW] Cache skip:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// ==============================
// ACTIVATE — hapus cache lama
// ==============================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ==============================
// FETCH — strategi cache
// ==============================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Firebase requests — harus selalu online
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('imagekit')
  ) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Strategi: Cache First, fallback ke network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Jangan cache response error atau non-GET
          if (!response || response.status !== 200 || request.method !== 'GET') {
            return response;
          }

          // Cache response baru
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback — tampilkan halaman utama
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('', { status: 503 });
        });
    })
  );
});

// ==============================
// PUSH NOTIFICATION (opsional)
// ==============================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'Pareffi', body: event.data.text() }; }

  const options = {
    body   : data.body || 'Ada notifikasi baru dari Pareffi!',
    icon   : './img/icon-192.png',
    badge  : './img/icon-192.png',
    vibrate: [200, 100, 200],
    data   : { url: data.url || './index.html' },
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pareffi Store', options)
  );
});

// ==============================
// NOTIFICATION CLICK
// ==============================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
