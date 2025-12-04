const CACHE_NAME = 'hello-chat-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/home.html',
  '/chat.html',
  '/profile_setup.html',
  '/edit_profile.html',
  '/calls.html',
  '/video_call.html',
  '/updates.html',
  '/create_group.html',
  '/group_settings.html',
  '/contact_info.html',
  '/settings.html',
  '/loading.html',
  '/supabase-config.js',
  '/firebase-config.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Assets (Offline Support logic)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Update Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});