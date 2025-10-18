// Service Worker Version - increment this when updating
const SW_VERSION = '1.0.1';
console.log(`Service Worker ${SW_VERSION} initializing...`);

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
});

// Get messaging instance
const messaging = firebase.messaging();

// Force update when a new service worker is waiting
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${SW_VERSION} installed`);
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Take control of all pages immediately
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${SW_VERSION} activated`);
  event.waitUntil(
    // Clear old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message from Bueno Brows',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'bueno-brows-message',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open Chat'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message, activating new service worker');
    self.skipWaiting();
  }
});
