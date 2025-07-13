# PWA Architecture Guide for Recalibrate

## Complete Technical Specifications for Mobile-First Career Platform

**Created**: July 10, 2025  
**Purpose**: Technical foundation for Recalibrate PWA development  
**Target**: First truly mobile-optimized career intelligence platform  

---

## PWA Architecture Overview

### Core Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla JS for performance)
- **PWA Framework**: Service Worker + Web App Manifest + IndexedDB
- **Voice Integration**: Web Speech API + AssemblyAI for advanced features
- **Storage**: IndexedDB (offline-first) + Origin Private File System (OPFS)
- **Performance**: 60fps mobile optimization with preloading and caching
- **Security**: HTTPS everywhere, encrypted local storage, privacy-first design

### PWA Core Components

```javascript
// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/recalibrate/sw.js');
      console.log('Recalibrate SW registered:', registration);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

// PWA Installation Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});
```

## Performance Requirements

### Mobile-First Performance Targets
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100ms

### Optimization Strategies

```javascript
// Critical Resource Preloading
<link rel="preload" href="/recalibrate/recalibrate.css" as="style">
<link rel="preload" href="/recalibrate/recalibrate.js" as="script">
<link rel="preload" href="/recalibrate/modules/voice-engine.js" as="script">

// Intersection Observer for Lazy Loading
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});
```

## Service Worker Implementation

### Caching Strategy
```javascript
// sw.js - Comprehensive Caching Strategy
const CACHE_NAME = 'recalibrate-v1.0.0';
const STATIC_CACHE = 'recalibrate-static-v1';
const DYNAMIC_CACHE = 'recalibrate-dynamic-v1';

const STATIC_ASSETS = [
  '/recalibrate/',
  '/recalibrate/index.html',
  '/recalibrate/recalibrate.css',
  '/recalibrate/recalibrate.js',
  '/recalibrate/manifest.json',
  '/recalibrate/modules/voice-engine.js',
  '/recalibrate/modules/gesture-handler.js',
  '/recalibrate/modules/offline-manager.js',
  '/recalibrate/modules/resume-builder.js',
  '/recalibrate/data/career-data.js'
];

// Install Event - Cache Static Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Fetch Event - Network First with Offline Fallback
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // API calls: Network first, cache as backup
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Static assets: Cache first
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

const networkFirstStrategy = async (request) => {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return caches.match(request);
  }
};
```

### Background Sync
```javascript
// Background Sync for Offline Form Submissions
self.addEventListener('sync', event => {
  if (event.tag === 'resume-sync') {
    event.waitUntil(syncResumeData());
  } else if (event.tag === 'ats-analysis-sync') {
    event.waitUntil(syncATSAnalysis());
  }
});

const syncResumeData = async () => {
  const offlineData = await getOfflineResumeData();
  for (const item of offlineData) {
    try {
      await fetch('/api/resume', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' }
      });
      await removeOfflineItem(item.id);
    } catch (error) {
      console.log('Sync failed, will retry:', error);
    }
  }
};
```

## Mobile-First UI Architecture

### Touch Optimization Framework
```css
/* 44px Minimum Touch Targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Thumb-Zone Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--nav-bg);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Safe Area Handling for iPhone X+ */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Gesture Recognition Integration
```javascript
// Advanced Touch Gesture Handler
class GestureHandler {
  constructor(element) {
    this.element = element;
    this.startPoint = null;
    this.isLongPress = false;
    this.longPressTimer = null;
    this.swipeThreshold = 50;
    this.longPressDelay = 500;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  handleTouchStart(e) {
    this.startPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    
    // Long press detection
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.triggerLongPress(e);
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
    }, this.longPressDelay);
  }
  
  handleTouchMove(e) {
    if (!this.startPoint) return;
    
    const currentPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    const deltaX = currentPoint.x - this.startPoint.x;
    const deltaY = currentPoint.y - this.startPoint.y;
    
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearTimeout(this.longPressTimer);
      this.isLongPress = false;
    }
  }
  
  handleTouchEnd(e) {
    clearTimeout(this.longPressTimer);
    
    if (this.isLongPress) {
      this.isLongPress = false;
      return;
    }
    
    if (!this.startPoint) return;
    
    const endPoint = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    const deltaX = endPoint.x - this.startPoint.x;
    const deltaY = endPoint.y - this.startPoint.y;
    const deltaTime = endPoint.time - this.startPoint.time;
    
    // Swipe detection
    if (Math.abs(deltaX) > this.swipeThreshold && deltaTime < 300) {
      if (deltaX > 0) {
        this.triggerSwipeRight();
      } else {
        this.triggerSwipeLeft();
      }
    } else if (Math.abs(deltaY) > this.swipeThreshold && deltaTime < 300) {
      if (deltaY > 0) {
        this.triggerSwipeDown();
      } else {
        this.triggerSwipeUp();
      }
    } else {
      this.triggerTap();
    }
    
    this.startPoint = null;
  }
}
```

## Voice Integration Architecture

### Web Speech API Implementation
```javascript
// Advanced Voice Engine with Professional Vocabulary
class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.professionalVocabulary = this.loadProfessionalTerms();
    this.confidenceThreshold = 0.7;
    
    this.initRecognition();
  }
  
  initRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = this.handleSpeechResult.bind(this);
    this.recognition.onerror = this.handleSpeechError.bind(this);
    this.recognition.onend = this.handleSpeechEnd.bind(this);
  }
  
  startListening(targetElement) {
    if (!this.recognition || this.isListening) return;
    
    this.targetElement = targetElement;
    this.isListening = true;
    this.recognition.start();
    
    // Visual feedback
    this.showListeningIndicator();
    if (navigator.vibrate) navigator.vibrate(100);
  }
  
  handleSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
        
        // Professional vocabulary enhancement
        finalTranscript = this.enhanceProfessionalLanguage(finalTranscript);
        
        // Confidence scoring
        const confidence = result[0].confidence;
        if (confidence >= this.confidenceThreshold) {
          this.insertText(finalTranscript);
        } else {
          this.showConfidenceWarning(finalTranscript, confidence);
        }
      } else {
        interimTranscript += result[0].transcript;
      }
    }
    
    this.showInterimResults(interimTranscript);
  }
  
  enhanceProfessionalLanguage(text) {
    // Replace common speech patterns with professional equivalents
    const enhancements = {
      'helped out': 'collaborated with',
      'worked on': 'led development of',
      'pretty good': 'effective',
      'a lot of': 'extensive',
      'kind of': 'strategically',
      'you know': ''
    };
    
    let enhanced = text;
    Object.keys(enhancements).forEach(casual => {
      const professional = enhancements[casual];
      enhanced = enhanced.replace(new RegExp(casual, 'gi'), professional);
    });
    
    return enhanced;
  }
}
```

## Offline-First Data Architecture

### IndexedDB Implementation
```javascript
// Comprehensive Offline Data Management
class OfflineManager {
  constructor() {
    this.dbName = 'RecalibrateDB';
    this.dbVersion = 1;
    this.db = null;
    
    this.initDatabase();
  }
  
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Resume data store
        const resumeStore = db.createObjectStore('resumes', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        resumeStore.createIndex('lastModified', 'lastModified', { unique: false });
        resumeStore.createIndex('jobTarget', 'jobTarget', { unique: false });
        
        // ATS analysis store
        const atsStore = db.createObjectStore('atsAnalyses', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        atsStore.createIndex('platform', 'platform', { unique: false });
        atsStore.createIndex('score', 'score', { unique: false });
        
        // Voice recordings store
        const voiceStore = db.createObjectStore('voiceRecordings', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        voiceStore.createIndex('type', 'type', { unique: false });
        voiceStore.createIndex('timestamp', 'timestamp', { unique: false });
        
        // Decision matrix store
        const decisionStore = db.createObjectStore('decisions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        decisionStore.createIndex('opportunity', 'opportunity', { unique: false });
        decisionStore.createIndex('status', 'status', { unique: false });
      };
    });
  }
  
  async saveResume(resumeData) {
    const transaction = this.db.transaction(['resumes'], 'readwrite');
    const store = transaction.objectStore('resumes');
    
    resumeData.lastModified = new Date().toISOString();
    resumeData.syncStatus = navigator.onLine ? 'synced' : 'pending';
    
    return store.add(resumeData);
  }
  
  async syncWithServer() {
    if (!navigator.onLine) return;
    
    const pendingData = await this.getPendingSync();
    
    for (const item of pendingData) {
      try {
        await this.uploadToServer(item);
        await this.markAsSynced(item.id);
      } catch (error) {
        console.log('Sync failed for item:', item.id, error);
      }
    }
  }
}
```

## Security and Privacy Framework

### Data Protection Implementation
```javascript
// Privacy-First Data Handling
class PrivacyManager {
  constructor() {
    this.encryptionKey = null;
    this.initEncryption();
  }
  
  async initEncryption() {
    // Generate encryption key for sensitive data
    this.encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encryptSensitiveData(data) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      encodedData
    );
    
    return {
      encryptedData: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv)
    };
  }
  
  // GDPR Compliance - Data Deletion
  async deleteAllUserData() {
    // Clear IndexedDB
    const stores = ['resumes', 'atsAnalyses', 'voiceRecordings', 'decisions'];
    for (const storeName of stores) {
      await this.clearStore(storeName);
    }
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear service worker cache
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
}
```

## Performance Monitoring

### Real-Time Performance Tracking
```javascript
// Performance Analytics for PWA Optimization
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.initPerformanceObserver();
  }
  
  initPerformanceObserver() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.metrics.FID = firstInput.processingStart - firstInput.startTime;
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Custom performance markers
    performance.mark('recalibrate-app-start');
    window.addEventListener('load', () => {
      performance.mark('recalibrate-app-loaded');
      performance.measure('recalibrate-load-time', 
        'recalibrate-app-start', 'recalibrate-app-loaded');
    });
  }
  
  reportMetrics() {
    return {
      ...this.metrics,
      loadTime: performance.getEntriesByName('recalibrate-load-time')[0]?.duration,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Deployment and Build Configuration

### Vite Configuration for PWA
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/recalibrate/',
  build: {
    outDir: '../recalibrate',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['lodash'],
          voice: ['./modules/voice-engine.js'],
          offline: ['./modules/offline-manager.js']
        }
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.recalibrate\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Recalibrate - Mobile-First Career Platform',
        short_name: 'Recalibrate',
        description: 'Where professionals fine-tune their future',
        theme_color: '#2c5aa0',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/recalibrate/',
        icons: [
          {
            src: 'assets/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'assets/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

---

*This PWA Architecture Guide provides the complete technical foundation for building Recalibrate as the first truly mobile-optimized career intelligence platform, with offline-first functionality, voice-enabled interfaces, and performance optimization designed specifically for professional productivity on mobile devices.*
