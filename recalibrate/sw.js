/*
 * RECALIBRATE SERVICE WORKER
 * PWA offline functionality for mobile-first career platform
 * 
 * Features:
 * - App shell caching
 * - Dynamic content caching
 * - Background sync for career data
 * - Push notifications (future)
 * - Offline-first architecture
 */

const CACHE_NAME = 'recalibrate-v1.0.0';
const STATIC_CACHE = 'recalibrate-static-v1';
const DYNAMIC_CACHE = 'recalibrate-dynamic-v1';

// Files to cache immediately (App Shell)
const STATIC_FILES = [
  '/recalibrate/',
  '/recalibrate/index.html',
  '/recalibrate/recalibrate.css',
  '/recalibrate/recalibrate.js',
  '/recalibrate/manifest.json',
  '/recalibrate/modules/voice-engine.js',
  '/recalibrate/modules/gesture-handler.js',
  '/recalibrate/modules/offline-manager.js',
  '/recalibrate/modules/resume-builder.js',
  '/recalibrate/data/career-data.js',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  // Favicon
  '../favicon-cw-dark.svg'
];

// Files to cache dynamically
const DYNAMIC_FILES = [
  // API endpoints (when implemented)
  '/api/resume',
  '/api/career-data',
  '/api/sync'
];

// Files that should always be fetched from network
const NETWORK_FIRST = [
  '/api/auth',
  '/api/real-time'
];

/*
 * INSTALL EVENT
 * Cache static files immediately
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
  
  // Take control immediately
  self.skipWaiting();
});

/*
 * ACTIVATE EVENT
 * Clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/*
 * FETCH EVENT
 * Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

/*
 * REQUEST HANDLING STRATEGIES
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Strategy 1: Network First (for critical real-time data)
  if (NETWORK_FIRST.some(pattern => url.pathname.includes(pattern))) {
    return networkFirst(request);
  }
  
  // Strategy 2: Cache First (for static assets)
  if (STATIC_FILES.some(file => url.pathname.includes(file)) || 
      url.origin !== location.origin) {
    return cacheFirst(request);
  }
  
  // Strategy 3: Stale While Revalidate (for dynamic content)
  return staleWhileRevalidate(request);
}

/*
 * CACHING STRATEGIES
 */

// Cache First - Try cache, fallback to network
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

// Network First - Try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Stale While Revalidate - Return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  // Fetch from network in background
  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background fetch failed:', error);
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  try {
    return await networkFetch;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

/*
 * OFFLINE FALLBACKS
 */
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // HTML pages - return app shell
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/recalibrate/index.html');
  }
  
  // API requests - return offline message
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Images - return placeholder
  if (request.headers.get('accept')?.includes('image/')) {
    return new Response(
      '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f0f0f0"/><text x="100" y="80" text-anchor="middle" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // Default fallback
  return new Response(
    'This content is not available offline',
    { status: 503, headers: { 'Content-Type': 'text/plain' } }
  );
}

/*
 * BACKGROUND SYNC
 * Sync career data when connection is restored
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'resume-sync') {
    event.waitUntil(syncResumeData());
  } else if (event.tag === 'activity-sync') {
    event.waitUntil(syncActivityData());
  }
});

async function syncResumeData() {
  try {
    console.log('📄 Syncing resume data...');
    
    // Get pending resume data from IndexedDB
    const db = await openDB('RecalibrateDB', 1);
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const pendingItems = await getAllFromStore(store);
    
    // Sync each item
    for (const item of pendingItems) {
      if (item.type === 'resume_save') {
        await syncResumeItem(item);
      }
    }
    
    console.log('✅ Resume sync completed');
  } catch (error) {
    console.error('❌ Resume sync failed:', error);
    throw error; // This will retry the sync
  }
}

async function syncActivityData() {
  try {
    console.log('📊 Syncing activity data...');
    
    // Similar to resume sync but for activities
    const db = await openDB('RecalibrateDB', 1);
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const pendingItems = await getAllFromStore(store);
    
    for (const item of pendingItems) {
      if (item.type === 'activity_save') {
        await syncActivityItem(item);
      }
    }
    
    console.log('✅ Activity sync completed');
  } catch (error) {
    console.error('❌ Activity sync failed:', error);
    throw error;
  }
}

async function syncResumeItem(item) {
  // Simulate API call - replace with actual endpoint
  const response = await fetch('/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.data)
  });
  
  if (!response.ok) {
    throw new Error(`Resume sync failed: ${response.status}`);
  }
  
  // Remove from sync queue
  await removeFromSyncQueue(item.id);
}

async function syncActivityItem(item) {
  // Simulate API call - replace with actual endpoint
  const response = await fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.data)
  });
  
  if (!response.ok) {
    throw new Error(`Activity sync failed: ${response.status}`);
  }
  
  // Remove from sync queue
  await removeFromSyncQueue(item.id);
}

/*
 * PUSH NOTIFICATIONS (Future Feature)
 */
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  const options = {
    body: 'You have new career opportunities!',
    icon: '/recalibrate/assets/icon-192.png',
    badge: '/recalibrate/assets/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/recalibrate/assets/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/recalibrate/assets/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Recalibrate', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/recalibrate/')
    );
  }
});

/*
 * MESSAGE HANDLING
 * Communication with main app
 */
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🧹 All caches cleared');
}

/*
 * UTILITY FUNCTIONS
 */

// IndexedDB helpers
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromSyncQueue(itemId) {
  const db = await openDB('RecalibrateDB', 1);
  const transaction = db.transaction(['syncQueue'], 'readwrite');
  const store = transaction.objectStore('syncQueue');
  await store.delete(itemId);
}

// Cache management
async function updateCache() {
  const cache = await caches.open(STATIC_CACHE);
  
  // Update static files
  for (const file of STATIC_FILES) {
    try {
      const response = await fetch(file);
      if (response.ok) {
        await cache.put(file, response);
      }
    } catch (error) {
      console.error(`Failed to update cache for ${file}:`, error);
    }
  }
}

// Periodic cache cleanup
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('recalibrate-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE
  );
  
  await Promise.all(
    oldCaches.map(cacheName => caches.delete(cacheName))
  );
  
  console.log(`🧹 Cleaned up ${oldCaches.length} old caches`);
}

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineFallbacks: 0
};

function trackCacheHit() {
  performanceMetrics.cacheHits++;
}

function trackCacheMiss() {
  performanceMetrics.cacheMisses++;
}

function trackNetworkRequest() {
  performanceMetrics.networkRequests++;
}

function trackOfflineFallback() {
  performanceMetrics.offlineFallbacks++;
}

// Export metrics for debugging
self.getMetrics = () => performanceMetrics;

/*
 * ERROR HANDLING
 */
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('🚀 Recalibrate Service Worker loaded');
console.log(`📦 Cache version: ${CACHE_NAME}`);