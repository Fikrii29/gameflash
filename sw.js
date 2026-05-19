// =====================================================
// GAMEFLASH - Service Worker (PWA)
// =====================================================

const CACHE_NAME = 'gameflash-v1.0.0';
const STATIC_CACHE = 'gameflash-static-v1.0.0';
const DYNAMIC_CACHE = 'gameflash-dynamic-v1.0.0';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/order.html',
  '/check-order.html',
  '/css/style.css',
  '/css/admin.css',
  '/js/storage.js',
  '/js/main.js',
  '/js/order.js',
  '/js/digiflazz.js',
  '/js/tokopay.js',
  '/js/fonnte.js',
  '/js/vip-reseller.js',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/ml.png',
  '/img/ff.png',
  '/img/pubg.png',
  '/img/genshin.png',
  '/img/hsr.png',
  '/img/valorant.png',
  '/img/codm.png',
  '/img/roblox.png',
  '/img/coc.png',
  '/img/cr.png',
  '/img/lol.png',
  '/img/wuwa.png',
  '/manifest.json'
];

// External resources to cache (Google Fonts, CDN, etc.)
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js'
];

// ── INSTALL ────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Gameflash Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets...');
      // Cache static assets, ignore failures for optional resources
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Static assets cached!');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// ── ACTIVATE ───────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Gameflash Service Worker...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated!');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// ── FETCH (Cache Strategy) ─────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls → Network only (never cache)
  if (isApiCall(url)) {
    event.respondWith(networkOnly(request));
    return;
  }

  // Google Fonts → Cache first, then network
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // CDN resources (Chart.js, etc.) → Cache first
  if (url.hostname.includes('jsdelivr') || url.hostname.includes('cdnjs')) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // App icons from iTunes/App Store → Cache first
  if (url.hostname.includes('mzstatic.com') || url.hostname.includes('apple.com')) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Local app files → Cache first, fallback to network
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ── CACHE STRATEGIES ───────────────────────────────────

// Cache First → best for static assets
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Return offline fallback
    return offlineFallback(request);
  }
}

// Network Only → for API calls
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Tidak ada koneksi internet', offline: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Offline Fallback
async function offlineFallback(request) {
  const url = new URL(request.url);

  // Return cached index for navigation requests
  if (request.mode === 'navigate') {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
  }

  // Return cached admin page
  if (url.pathname.includes('/admin/')) {
    const cached = await caches.match('/admin/index.html');
    if (cached) return cached;
  }

  // Generic offline response
  return new Response(
    `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Offline - Gameflash</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#05050f; color:#fff; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:20px; }
    .container { max-width:400px; }
    .icon { font-size:5rem; margin-bottom:24px; animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    h1 { font-size:1.8rem; margin-bottom:12px; background:linear-gradient(135deg,#00d4ff,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    p { color:#94a3b8; margin-bottom:24px; line-height:1.6; }
    button { background:linear-gradient(135deg,#00d4ff,#8b5cf6); color:#fff; border:none; padding:12px 28px; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; }
    button:hover { opacity:0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚡</div>
    <h1>Kamu Sedang Offline</h1>
    <p>Tidak ada koneksi internet. Beberapa fitur Gameflash mungkin tidak tersedia, namun kamu masih bisa melihat data yang sudah tersimpan.</p>
    <button onclick="location.reload()">🔄 Coba Lagi</button>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
  );
}

// ── HELPERS ────────────────────────────────────────────
function isApiCall(url) {
  const apiHosts = [
    'api.digiflazz.com',
    'api.tokopay.id',
    'api.fonnte.com',
    'vip-reseller.co.id',
    'api.ipify.org',
    'api64.ipify.org',
    'api.my-ip.io',
    'itunes.apple.com'
  ];
  return apiHosts.some(host => url.hostname.includes(host));
}

// ── BACKGROUND SYNC ────────────────────────────────────
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // This runs when connection is restored
  console.log('[SW] Syncing pending transactions...');
}

// ── PUSH NOTIFICATIONS ─────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Ada update transaksi kamu!',
    icon: '/img/icon-192.png',
    badge: '/img/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '🔍 Lihat Detail' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Gameflash', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow(url);
      })
    );
  }
});

console.log('[SW] Gameflash Service Worker loaded ✅');
