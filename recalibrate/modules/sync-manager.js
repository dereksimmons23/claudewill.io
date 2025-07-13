/**
 * Cross-Device Sync Manager
 * Handles seamless synchronization across devices for Recalibrate platform
 * Chrome-style handoff and state management
 * 
 * @author Derek Simmons - Claude Wisdom Strategies  
 * @version 1.0.0
 */

class SyncManager {
    constructor(options = {}) {
        this.options = {
            cloudProvider: options.cloudProvider || 'auto', // auto, firebase, supabase, custom
            syncInterval: options.syncInterval || 5000, // 5 seconds
            conflictResolution: options.conflictResolution || 'timestamp', // timestamp, manual, merge
            encryptionEnabled: options.encryptionEnabled || true,
            offlineQueueSize: options.offlineQueueSize || 100,
            ...options
        };

        this.deviceId = this.generateDeviceId();
        this.sessionId = this.generateSessionId();
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.lastSyncTime = null;
        this.activeConnections = new Map();
        
        this.initializeSync();
        this.setupEventListeners();
    }

    /**
     * Initialize synchronization system
     */
    async initializeSync() {
        try {
            // Initialize local storage
            await this.initializeLocalStorage();
            
            // Initialize cloud connection
            await this.initializeCloudConnection();
            
            // Start sync process
            this.startSyncProcess();
            
            // Register device
            await this.registerDevice();
            
            console.log('SyncManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SyncManager:', error);
        }
    }

    /**
     * Save data with automatic cross-device sync
     * @param {string} key - Data key
     * @param {any} data - Data to save
     * @param {Object} options - Save options
     */
    async save(key, data, options = {}) {
        const syncItem = {
            id: this.generateId(),
            key,
            data,
            timestamp: Date.now(),
            deviceId: this.deviceId,
            sessionId: this.sessionId,
            version: (await this.getVersion(key)) + 1,
            checksum: this.generateChecksum(data),
            metadata: {
                operation: 'save',
                priority: options.priority || 'normal',
                source: options.source || 'user',
                ...options.metadata
            }
        };

        try {
            // Save locally first (offline-first approach)
            await this.saveLocal(syncItem);
            
            // Add to sync queue
            this.addToSyncQueue(syncItem);
            
            // Immediate sync if online
            if (this.isOnline) {
                await this.syncImmediate(syncItem);
            }
            
            // Emit save event
            this.emitSyncEvent('dataSaved', { key, data, syncItem });
            
            return syncItem;
        } catch (error) {
            console.error('Failed to save data:', error);
            throw error;
        }
    }

    /**
     * Load data with cross-device synchronization
     * @param {string} key - Data key
     * @param {Object} options - Load options
     */
    async load(key, options = {}) {
        try {
            // Check for cloud updates first if online
            if (this.isOnline && !options.localOnly) {
                await this.syncFromCloud(key);
            }
            
            // Load from local storage
            const localData = await this.loadLocal(key);
            
            if (localData) {
                this.emitSyncEvent('dataLoaded', { key, data: localData.data });
                return localData.data;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    /**
     * Enable seamless handoff to another device
     * @param {string} targetDevice - Target device type ('mobile', 'desktop', 'tablet')
     * @param {Object} context - Current context to handoff
     */
    async createHandoff(targetDevice, context) {
        const handoffData = {
            id: this.generateId(),
            sourceDevice: deviceContext.context,
            targetDevice,
            context,
            timestamp: Date.now(),
            expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
            sessionId: this.sessionId,
            handoffType: context.type || 'resume-editing'
        };

        try {
            // Save handoff data to cloud
            await this.saveToCloud('handoffs', handoffData.id, handoffData);
            
            // Generate handoff URL/QR code
            const handoffUrl = await this.generateHandoffUrl(handoffData.id);
            
            // Send notification if supported
            if ('serviceWorker' in navigator && 'Notification' in window) {
                await this.sendHandoffNotification(handoffData, handoffUrl);
            }
            
            this.emitSyncEvent('handoffCreated', { handoffData, handoffUrl });
            
            return {
                id: handoffData.id,
                url: handoffUrl,
                qrCode: await this.generateQRCode(handoffUrl),
                expiresAt: handoffData.expiresAt
            };
        } catch (error) {
            console.error('Failed to create handoff:', error);
            throw error;
        }
    }

    /**
     * Accept handoff from another device
     * @param {string} handoffId - Handoff identifier
     */
    async acceptHandoff(handoffId) {
        try {
            // Load handoff data
            const handoffData = await this.loadFromCloud('handoffs', handoffId);
            
            if (!handoffData) {
                throw new Error('Handoff not found or expired');
            }
            
            if (Date.now() > handoffData.expiresAt) {
                throw new Error('Handoff has expired');
            }
            
            // Load the context data
            const contextData = await this.loadContextData(handoffData.context);
            
            // Apply context to current device
            await this.applyHandoffContext(handoffData.context, contextData);
            
            // Clean up handoff
            await this.deleteFromCloud('handoffs', handoffId);
            
            this.emitSyncEvent('handoffAccepted', { handoffData, contextData });
            
            return {
                success: true,
                context: handoffData.context,
                data: contextData,
                sourceDevice: handoffData.sourceDevice
            };
        } catch (error) {
            console.error('Failed to accept handoff:', error);
            throw error;
        }
    }

    /**
     * Real-time sync across active devices
     * @param {string} key - Data key to sync
     * @param {any} data - Data to sync
     */
    async syncRealTime(key, data) {
        if (!this.isOnline) return;

        const syncMessage = {
            type: 'realtime-sync',
            key,
            data,
            timestamp: Date.now(),
            deviceId: this.deviceId,
            sessionId: this.sessionId
        };

        try {
            // Send to all active connections
            for (const [deviceId, connection] of this.activeConnections) {
                if (deviceId !== this.deviceId) {
                    await connection.send(syncMessage);
                }
            }
            
            this.emitSyncEvent('realTimeSynced', { key, data });
        } catch (error) {
            console.error('Real-time sync failed:', error);
        }
    }

    /**
     * Handle incoming real-time sync
     * @param {Object} message - Sync message
     */
    async handleRealTimeSync(message) {
        if (message.deviceId === this.deviceId) return; // Ignore own messages

        try {
            // Check for conflicts
            const localVersion = await this.getVersion(message.key);
            const conflict = localVersion > 0 && 
                           message.timestamp < (await this.getLastModified(message.key));

            if (conflict) {
                await this.handleSyncConflict(message.key, message.data, message);
            } else {
                // Apply the update
                await this.saveLocal({
                    key: message.key,
                    data: message.data,
                    timestamp: message.timestamp,
                    deviceId: message.deviceId,
                    version: localVersion + 1,
                    metadata: { source: 'realtime-sync' }
                });
                
                this.emitSyncEvent('realTimeSyncReceived', message);
            }
        } catch (error) {
            console.error('Failed to handle real-time sync:', error);
        }
    }

    /**
     * Handle sync conflicts
     * @param {string} key - Data key
     * @param {any} incomingData - Incoming data
     * @param {Object} incomingMessage - Full incoming message
     */
    async handleSyncConflict(key, incomingData, incomingMessage) {
        const localData = await this.loadLocal(key);
        
        switch (this.options.conflictResolution) {
            case 'timestamp':
                // Use most recent timestamp
                if (incomingMessage.timestamp > localData.timestamp) {
                    await this.saveLocal({
                        ...incomingMessage,
                        metadata: { ...incomingMessage.metadata, conflictResolution: 'timestamp' }
                    });
                }
                break;
                
            case 'merge':
                // Attempt to merge data
                const mergedData = await this.mergeData(localData.data, incomingData);
                await this.save(key, mergedData, { source: 'conflict-merge' });
                break;
                
            case 'manual':
                // Emit conflict event for manual resolution
                this.emitSyncEvent('syncConflict', {
                    key,
                    localData: localData.data,
                    incomingData,
                    localTimestamp: localData.timestamp,
                    incomingTimestamp: incomingMessage.timestamp
                });
                break;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStateChange(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOnlineStateChange(false);
        });

        // Page visibility for sync optimization
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            } else {
                this.handlePageHidden();
            }
        });

        // Before unload - save any pending data
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });

        // Storage events (for same-origin tab sync)
        window.addEventListener('storage', (event) => {
            this.handleStorageEvent(event);
        });
    }

    /**
     * Handle online state changes
     * @param {boolean} isOnline - Online state
     */
    async handleOnlineStateChange(isOnline) {
        if (isOnline) {
            // Process sync queue when coming back online
            await this.processSyncQueue();
            
            // Resume real-time connections
            await this.resumeRealTimeSync();
        } else {
            // Cache current state for offline use
            await this.cacheForOffline();
        }
        
        this.emitSyncEvent('onlineStateChanged', { isOnline });
    }

    /**
     * Handle page becoming visible
     */
    async handlePageVisible() {
        // Sync latest changes when page becomes visible
        if (this.isOnline) {
            await this.syncFromCloud();
        }
    }

    /**
     * Handle page becoming hidden
     */
    handlePageHidden() {
        // Save any pending changes
        this.flushPendingChanges();
    }

    /**
     * Handle page unload
     */
    handlePageUnload() {
        // Send any critical sync data
        if (this.syncQueue.length > 0 && this.isOnline) {
            // Use sendBeacon for reliable data sending
            const criticalData = this.syncQueue.filter(item => 
                item.metadata.priority === 'critical'
            );
            
            if (criticalData.length > 0) {
                navigator.sendBeacon(
                    this.getSyncEndpoint(),
                    JSON.stringify(criticalData)
                );
            }
        }
    }

    // Utility methods

    generateDeviceId() {
        const stored = localStorage.getItem('recalibrate-device-id');
        if (stored) return stored;
        
        const deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('recalibrate-device-id', deviceId);
        return deviceId;
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateChecksum(data) {
        // Simple checksum for data integrity
        return btoa(JSON.stringify(data)).length;
    }

    async getVersion(key) {
        const item = await this.loadLocal(key);
        return item ? item.version : 0;
    }

    async getLastModified(key) {
        const item = await this.loadLocal(key);
        return item ? item.timestamp : 0;
    }

    emitSyncEvent(eventType, data) {
        const event = new CustomEvent(`sync-${eventType}`, {
            detail: {
                ...data,
                timestamp: Date.now(),
                deviceId: this.deviceId,
                sessionId: this.sessionId
            }
        });
        
        document.dispatchEvent(event);
    }

    // Storage methods (implement based on chosen backend)

    async initializeLocalStorage() {
        // Initialize IndexedDB for local storage
        if (!this.capabilities?.indexedDB) {
            throw new Error('IndexedDB not supported');
        }
        
        // Setup IndexedDB schema
        // Implementation depends on chosen storage solution
    }

    async initializeCloudConnection() {
        // Initialize cloud connection based on provider
        // Implementation depends on chosen cloud provider
    }

    async saveLocal(syncItem) {
        // Save to IndexedDB
        // Implementation depends on storage solution
    }

    async loadLocal(key) {
        // Load from IndexedDB
        // Implementation depends on storage solution
    }

    async saveToCloud(collection, id, data) {
        // Save to cloud provider
        // Implementation depends on cloud provider
    }

    async loadFromCloud(collection, id) {
        // Load from cloud provider
        // Implementation depends on cloud provider
    }

    async deleteFromCloud(collection, id) {
        // Delete from cloud provider
        // Implementation depends on cloud provider
    }

    // Placeholder methods for future implementation

    async startSyncProcess() {
        // Start periodic sync process
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.processSyncQueue();
            }
        }, this.options.syncInterval);
    }

    async registerDevice() {
        // Register device with cloud service
    }

    addToSyncQueue(syncItem) {
        this.syncQueue.push(syncItem);
        
        // Limit queue size
        if (this.syncQueue.length > this.options.offlineQueueSize) {
            this.syncQueue.shift(); // Remove oldest item
        }
    }

    async syncImmediate(syncItem) {
        // Immediate sync to cloud
    }

    async syncFromCloud(key = null) {
        // Sync specific key or all data from cloud
    }

    async processSyncQueue() {
        // Process all items in sync queue
    }

    async loadContextData(context) {
        // Load context-specific data
        return {};
    }

    async applyHandoffContext(context, data) {
        // Apply handoff context to current device
    }

    async generateHandoffUrl(handoffId) {
        return `${window.location.origin}/recalibrate?handoff=${handoffId}`;
    }

    async generateQRCode(url) {
        // Generate QR code for handoff URL
        return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">QR Code: ${url}</text></svg>`;
    }

    async sendHandoffNotification(handoffData, handoffUrl) {
        // Send notification for handoff
    }

    async resumeRealTimeSync() {
        // Resume real-time sync connections
    }

    async cacheForOffline() {
        // Cache critical data for offline use
    }

    flushPendingChanges() {
        // Flush any pending changes
    }

    getSyncEndpoint() {
        return '/api/sync';
    }

    async mergeData(localData, incomingData) {
        // Merge conflicting data
        // Default: prefer incoming data
        return incomingData;
    }

    handleStorageEvent(event) {
        // Handle storage events from other tabs
        if (event.key?.startsWith('recalibrate-sync-')) {
            this.emitSyncEvent('crossTabSync', {
                key: event.key,
                newValue: event.newValue,
                oldValue: event.oldValue
            });
        }
    }
}

// Initialize sync manager
const syncManager = new SyncManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
} else {
    window.SyncManager = SyncManager;
    window.syncManager = syncManager;
}
