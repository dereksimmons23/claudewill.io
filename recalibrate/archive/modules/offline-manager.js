/*
 * RECALIBRATE OFFLINE MANAGER
 * Advanced offline capabilities for mobile-first career platform
 * 
 * Features:
 * - Service Worker management
 * - IndexedDB storage with career-specific schemas
 * - Background sync for resume data
 * - Offline-first architecture
 * - Network status monitoring
 */

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.dbName = 'RecalibrateDB';
    this.dbVersion = 1;
    this.db = null;
    this.syncQueue = [];
    this.serviceWorker = null;
    
    // Storage quotas
    this.maxStorageSize = 50 * 1024 * 1024; // 50MB
    this.warningThreshold = 0.8; // 80% of quota
    
    this.init();
  }

  async init() {
    await this.initDatabase();
    await this.registerServiceWorker();
    this.setupNetworkMonitoring();
    this.setupPeriodicSync();
    console.log('💾 Offline Manager initialized');
  }

  // IndexedDB Setup for Career Data
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
        if (!db.objectStoreNames.contains('resumes')) {
          const resumeStore = db.createObjectStore('resumes', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          resumeStore.createIndex('lastModified', 'lastModified');
          resumeStore.createIndex('version', 'version');
        }
        
        // Career activities store
        if (!db.objectStoreNames.contains('activities')) {
          const activityStore = db.createObjectStore('activities', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          activityStore.createIndex('timestamp', 'timestamp');
          activityStore.createIndex('type', 'type');
        }
        
        // User preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        
        // Voice commands cache
        if (!db.objectStoreNames.contains('voiceCache')) {
          const voiceStore = db.createObjectStore('voiceCache', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          voiceStore.createIndex('context', 'context');
          voiceStore.createIndex('confidence', 'confidence');
        }
        
        // Sync queue for offline actions
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/recalibrate/sw.js');
        this.serviceWorker = registration;
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdate();
            }
          });
        });
        
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Network Status Monitoring
  setupNetworkMonitoring() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Check connection quality
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.handleConnectionChange();
      });
    }
  }

  handleOnline() {
    this.isOnline = true;
    this.dispatchEvent('online');
    this.processSyncQueue();
    console.log('📶 Connection restored');
  }

  handleOffline() {
    this.isOnline = false;
    this.dispatchEvent('offline');
    console.log('📱 Working offline');
  }

  handleConnectionChange() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const quality = this.assessConnectionQuality(connection);
      
      this.dispatchEvent('connectionchange', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        quality: quality
      });
    }
  }

  assessConnectionQuality(connection) {
    const downlink = connection.downlink || 0;
    const effectiveType = connection.effectiveType || 'unknown';
    
    if (effectiveType === '4g' && downlink > 2) return 'excellent';
    if (effectiveType === '4g' || downlink > 1) return 'good';
    if (effectiveType === '3g' || downlink > 0.5) return 'fair';
    return 'poor';
  }

  // Resume Data Management
  async saveResume(resumeData) {
    const resume = {
      ...resumeData,
      id: resumeData.id || Date.now(),
      lastModified: Date.now(),
      version: (resumeData.version || 0) + 1,
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    try {
      await this.storeData('resumes', resume);
      
      if (!this.isOnline) {
        await this.addToSyncQueue({
          type: 'resume_save',
          data: resume,
          priority: 1
        });
      }
      
      this.dispatchEvent('resumesaved', { resume });
      return resume;
    } catch (error) {
      console.error('Failed to save resume:', error);
      throw error;
    }
  }

  async getResumes() {
    try {
      return await this.getData('resumes');
    } catch (error) {
      console.error('Failed to get resumes:', error);
      return [];
    }
  }

  async getLatestResume() {
    try {
      const resumes = await this.getData('resumes');
      return resumes.sort((a, b) => b.lastModified - a.lastModified)[0];
    } catch (error) {
      console.error('Failed to get latest resume:', error);
      return null;
    }
  }

  // Activity Tracking
  async saveActivity(activity) {
    const activityData = {
      ...activity,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };

    try {
      await this.storeData('activities', activityData);
      
      if (!this.isOnline) {
        await this.addToSyncQueue({
          type: 'activity_save',
          data: activityData,
          priority: 3
        });
      }
      
      return activityData;
    } catch (error) {
      console.error('Failed to save activity:', error);
      throw error;
    }
  }

  async getRecentActivities(limit = 10) {
    try {
      const activities = await this.getData('activities');
      return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  // Voice Cache Management
  async cacheVoiceCommand(command, result) {
    const cacheData = {
      command: command.cleaned,
      result: result,
      context: command.context,
      confidence: command.confidence,
      timestamp: Date.now(),
      useCount: 1
    };

    try {
      // Check if command already exists
      const existing = await this.findVoiceCacheEntry(command.cleaned, command.context);
      
      if (existing) {
        existing.useCount++;
        existing.timestamp = Date.now();
        await this.storeData('voiceCache', existing);
      } else {
        await this.storeData('voiceCache', cacheData);
      }
    } catch (error) {
      console.error('Failed to cache voice command:', error);
    }
  }

  async findVoiceCacheEntry(command, context) {
    try {
      const cache = await this.getData('voiceCache');
      return cache.find(entry => 
        entry.command === command && entry.context === context
      );
    } catch (error) {
      return null;
    }
  }

  // Generic Database Operations
  async storeData(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getData(storeName, key = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request;
      if (key) {
        request = store.get(key);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Management
  async addToSyncQueue(item) {
    const queueItem = {
      ...item,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };

    await this.storeData('syncQueue', queueItem);
    this.syncQueue.push(queueItem);
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const queue = await this.getData('syncQueue');
    
    for (const item of queue) {
      try {
        await this.syncItem(item);
        await this.deleteData('syncQueue', item.id);
        console.log(`✅ Synced ${item.type}`);
      } catch (error) {
        item.attempts++;
        
        if (item.attempts >= item.maxAttempts) {
          console.error(`❌ Failed to sync ${item.type} after ${item.maxAttempts} attempts`);
          await this.deleteData('syncQueue', item.id);
        } else {
          await this.storeData('syncQueue', item);
        }
      }
    }
    
    this.syncQueue = [];
  }

  async syncItem(item) {
    // Simulate API sync - replace with actual API calls
    switch (item.type) {
      case 'resume_save':
        console.log('Syncing resume to cloud...');
        // await this.apiClient.saveResume(item.data);
        break;
        
      case 'activity_save':
        console.log('Syncing activity to analytics...');
        // await this.apiClient.saveActivity(item.data);
        break;
        
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  // Periodic Sync Setup
  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  // Storage Management
  async checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || this.maxStorageSize;
        const percentage = usage / quota;
        
        if (percentage > this.warningThreshold) {
          this.dispatchEvent('storagequotawarning', {
            usage,
            quota,
            percentage
          });
        }
        
        return { usage, quota, percentage };
      } catch (error) {
        console.error('Failed to check storage quota:', error);
        return null;
      }
    }
    return null;
  }

  async clearOldData() {
    try {
      // Clear voice cache older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const voiceCache = await this.getData('voiceCache');
      
      for (const entry of voiceCache) {
        if (entry.timestamp < thirtyDaysAgo && entry.useCount < 5) {
          await this.deleteData('voiceCache', entry.id);
        }
      }
      
      // Clear old activities (keep last 100)
      const activities = await this.getData('activities');
      const sortedActivities = activities.sort((a, b) => b.timestamp - a.timestamp);
      
      if (sortedActivities.length > 100) {
        const toDelete = sortedActivities.slice(100);
        for (const activity of toDelete) {
          await this.deleteData('activities', activity.id);
        }
      }
      
      console.log('🧹 Old data cleared');
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }

  // User Preferences
  async savePreference(key, value) {
    await this.storeData('preferences', { key, value });
  }

  async getPreference(key, defaultValue = null) {
    try {
      const result = await this.getData('preferences', key);
      return result ? result.value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  // Export/Import Career Data
  async exportCareerData() {
    try {
      const resumes = await this.getData('resumes');
      const activities = await this.getData('activities');
      const preferences = await this.getData('preferences');
      
      const exportData = {
        version: this.dbVersion,
        timestamp: Date.now(),
        data: {
          resumes,
          activities,
          preferences
        }
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export career data:', error);
      throw error;
    }
  }

  async importCareerData(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate import data
      if (!importData.data || !importData.version) {
        throw new Error('Invalid import data format');
      }
      
      // Import each data type
      if (importData.data.resumes) {
        for (const resume of importData.data.resumes) {
          await this.storeData('resumes', resume);
        }
      }
      
      if (importData.data.activities) {
        for (const activity of importData.data.activities) {
          await this.storeData('activities', activity);
        }
      }
      
      if (importData.data.preferences) {
        for (const pref of importData.data.preferences) {
          await this.storeData('preferences', pref);
        }
      }
      
      console.log('📥 Career data imported successfully');
      this.dispatchEvent('dataimported');
    } catch (error) {
      console.error('Failed to import career data:', error);
      throw error;
    }
  }

  // Service Worker Communication
  notifyUpdate() {
    this.dispatchEvent('updateavailable');
  }

  async skipWaiting() {
    if (this.serviceWorker && this.serviceWorker.waiting) {
      this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Event System
  dispatchEvent(type, detail = {}) {
    const event = new CustomEvent(`offline${type}`, { detail });
    document.dispatchEvent(event);
  }

  // Utility Methods
  isConnected() {
    return this.isOnline;
  }

  getConnectionQuality() {
    if ('connection' in navigator) {
      return this.assessConnectionQuality(navigator.connection);
    }
    return 'unknown';
  }

  async getStats() {
    const resumes = await this.getData('resumes');
    const activities = await this.getData('activities');
    const voiceCache = await this.getData('voiceCache');
    const syncQueue = await this.getData('syncQueue');
    const quota = await this.checkStorageQuota();
    
    return {
      resumeCount: resumes.length,
      activityCount: activities.length,
      voiceCacheSize: voiceCache.length,
      pendingSyncItems: syncQueue.length,
      storageUsage: quota,
      isOnline: this.isOnline
    };
  }
}

// Initialize and export
if (typeof window !== 'undefined') {
  window.OfflineManager = OfflineManager;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineManager;
}