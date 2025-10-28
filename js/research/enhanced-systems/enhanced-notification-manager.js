// src/components/notification/NotificationManager.js
import { EventEmitter } from '../../utils/EventEmitter.js';
import { Analytics } from '../../utils/Analytics.js';

class NotificationManager extends EventEmitter {
    constructor() {
        super();
        
        // Core configuration
        this.config = {
            batchingEnabled: true,
            batchInterval: 5 * 60 * 1000, // 5 minutes
            maxRetries: 3,
            maxQueueSize: 1000
        };

        // Priority queues (1-5, 1 being highest)
        this.queues = {
            1: [], // Critical - immediate delivery
            2: [], // High - minimal batching
            3: [], // Medium - standard batching
            4: [], // Low - extended batching
            5: []  // Background - max batching
        };

        // Batch timers
        this.batchTimers = {
            2: null,
            3: null,
            4: null,
            5: null
        };

        // System state tracking
        this.flowState = null;
        this.quantumState = null;
        this.systemHealth = 'healthy';

        // Analytics
        this.analytics = new Analytics();
        this.notificationHistory = [];
    }

    async initialize() {
        try {
            // Load notification patterns
            await this.loadNotificationPatterns();
            
            // Start batch processors
            this.startBatchProcessors();
            
            // Initialize health monitoring
            this.startHealthMonitoring();
            
            return true;
        } catch (error) {
            this.emit('error', error);
            return false;
        }
    }

    async enqueueNotification(notification) {
        try {
            // Validate notification
            if (!this.validateNotification(notification)) {
                throw new Error('Invalid notification format');
            }

            // Calculate priority if not specified
            if (!notification.priority) {
                notification.priority = await this.calculatePriority(notification);
            }

            // Add metadata
            const enrichedNotification = {
                ...notification,
                id: this.generateNotificationId(),
                timestamp: new Date().toISOString(),
                attempts: 0
            };

            // Add to appropriate queue
            this.queues[enrichedNotification.priority].push(enrichedNotification);

            // Process queue based on priority
            await this.processQueue(enrichedNotification.priority);

            return enrichedNotification.id;
        } catch (error) {
            this.emit('error', error);
            return null;
        }
    }

    async processQueue(priority) {
        // Priority 1 notifications are processed immediately
        if (priority === 1) {
            while (this.queues[1].length > 0) {
                const notification = this.queues[1].shift();
                await this.deliverNotification(notification);
            }
            return;
        }

        // Other priorities use batching if enabled
        if (this.config.batchingEnabled) {
            // Clear existing timer
            if (this.batchTimers[priority]) {
                clearTimeout(this.batchTimers[priority]);
            }

            // Set new batch timer
            this.batchTimers[priority] = setTimeout(
                () => this.processBatch(priority),
                this.getBatchDelay(priority)
            );
        }
    }

    async processBatch(priority) {
        const queue = this.queues[priority];
        if (queue.length === 0) return;

        // Group notifications by type
        const groups = this.groupNotifications(queue);
        
        // Process each group
        for (const [type, notifications] of groups.entries()) {
            await this.deliverBatchNotification(type, notifications);
        }

        // Clear the queue
        this.queues[priority] = [];
    }

    groupNotifications(notifications) {
        return notifications.reduce((groups, notification) => {
            const key = notification.type;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(notification);
            return groups;
        }, new Map());
    }

    async deliverBatchNotification(type, notifications) {
        // Create batch notification
        const batchNotification = {
            id: this.generateNotificationId(),
            type: `${type}-batch`,
            timestamp: new Date().toISOString(),
            content: this.aggregateContent(notifications),
            count: notifications.length,
            summary: this.generateBatchSummary(notifications)
        };

        await this.deliverNotification(batchNotification);
    }

    async deliverNotification(notification) {
        try {
            // Check suppression rules
            if (this.shouldSuppress(notification)) {
                return;
            }

            // Apply quantum state adjustments
            const adjustedNotification = this.applyQuantumAdjustments(notification);

            // Format for delivery
            const formattedNotification = this.formatNotification(adjustedNotification);

            // Update history
            this.updateHistory(formattedNotification);

            // Emit notification event
            this.emit('notification', formattedNotification);

            // Log delivery
            await this.logDelivery(formattedNotification);

            return true;
        } catch (error) {
            // Handle delivery failure
            await this.handleDeliveryFailure(notification, error);
            return false;
        }
    }

    async calculatePriority(notification) {
        let priority = 3; // Default priority

        // Adjust based on content
        priority = await this.adjustPriorityForContent(notification, priority);

        // Adjust based on flow state
        priority = this.adjustPriorityForFlowState(priority);

        // Adjust based on quantum state
        priority = this.adjustPriorityForQuantumState(priority);

        // Adjust based on system health
        priority = this.adjustPriorityForSystemHealth(priority);

        return Math.max(1, Math.min(5, priority));
    }

    async adjustPriorityForContent(notification, priority) {
        // Analyze content significance
        const significance = await this.analytics.analyzeSignificance(notification);

        if (significance > 0.8) priority--;
        if (significance < 0.3) priority++;

        return priority;
    }

    adjustPriorityForFlowState(priority) {
        if (!this.flowState) return priority;

        // Increase priority during low flow states
        if (this.flowState.score < 30) priority--;

        // Decrease priority during deep flow
        if (this.flowState.score > 80) priority++;

        return priority;
    }

    adjustPriorityForQuantumState(priority) {
        if (!this.quantumState) return priority;

        // Adjust based on quantum state stability
        if (this.quantumState.stability < 0.5) priority--;

        // Adjust based on state transitions
        if (this.quantumState.transitioning) priority--;

        return priority;
    }

    adjustPriorityForSystemHealth(priority) {
        if (this.systemHealth === 'critical') priority--;
        if (this.systemHealth === 'degraded') priority = Math.min(priority, 4);
        return priority;
    }

    shouldSuppress(notification) {
        // Check flow state
        if (this.flowState?.score > 80 && notification.priority > 2) {
            return true;
        }

        // Check quantum state
        if (this.quantumState?.sensitive && notification.priority > 1) {
            return true;
        }

        // Check recent duplicates
        if (this.isDuplicate(notification)) {
            return true;
        }

        return false;
    }

    applyQuantumAdjustments(notification) {
        if (!this.quantumState) return notification;

        // Adjust content based on quantum state
        const adjustedNotification = { ...notification };
        
        // Enhance significance in uncertain states
        if (this.quantumState.uncertainty > 0.7) {
            adjustedNotification.significance *= 1.5;
        }

        // Add quantum context
        adjustedNotification.quantumContext = {
            state: this.quantumState.current,
            uncertainty: this.quantumState.uncertainty,
            implications: this.quantumState.implications
        };

        return adjustedNotification;
    }

    getBatchDelay(priority) {
        const delays = {
            2: 60 * 1000,     // 1 minute
            3: 5 * 60 * 1000, // 5 minutes
            4: 15 * 60 * 1000,// 15 minutes
            5: 60 * 60 * 1000 // 1 hour
        };

        return delays[priority] || this.config.batchInterval;
    }

    updateFlowState(state) {
        this.flowState = state;
        this.adjustActiveNotifications();
    }

    updateQuantumState(state) {
        this.quantumState = state;
        this.adjustActiveNotifications();
    }

    async adjustActiveNotifications() {
        // Reprioritize queued notifications
        for (let priority = 1; priority <= 5; priority++) {
            const queue = this.queues[priority];
            for (const notification of queue) {
                const newPriority = await this.calculatePriority(notification);
                if (newPriority !== priority) {
                    // Move to new priority queue
                    this.queues[priority] = this.queues[priority]
                        .filter(n => n.id !== notification.id);
                    this.queues[newPriority].push({
                        ...notification,
                        priority: newPriority
                    });
                }
            }
        }
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    updateHistory(notification) {
        this.notificationHistory.push(notification);
        
        // Maintain history size
        if (this.notificationHistory.length > this.config.maxQueueSize) {
            this.notificationHistory = this.notificationHistory
                .slice(-this.config.maxQueueSize);
        }
    }

    async checkHealth() {
        return {
            status: 'healthy',
            metrics: {
                queueSizes: Object.fromEntries(
                    Object.entries(this.queues)
                        .map(([priority, queue]) => [priority, queue.length])
                ),
                historySize: this.notificationHistory.length,
                batchingEnabled: this.config.batchingEnabled
            }
        };
    }
}

export default NotificationManager;