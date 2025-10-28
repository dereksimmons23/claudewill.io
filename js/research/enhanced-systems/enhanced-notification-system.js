class NotificationManager {
    constructor() {
        this.preferences = {
            morningBrief: true,
            statusUpdates: true,
            transitionAlerts: true,
            energyReminders: true,
            batchingEnabled: true,
            batchInterval: 5 * 60 * 1000, // 5 minutes
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '07:00'
            }
        };

        // Priority levels: 1 (highest) to 5 (lowest)
        this.priorityThresholds = {
            1: 0,      // Immediate delivery
            2: 1000,   // 1 second delay for batching
            3: 300000, // 5 minutes
            4: 900000, // 15 minutes
            5: 3600000 // 1 hour
        };

        this.notificationQueues = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        this.batchTimers = {
            2: null,
            3: null,
            4: null,
            5: null
        };

        this.lastNotification = null;
        this.notificationHistory = [];
    }

    async enqueueNotification(notification) {
        // Add priority if not specified
        if (!notification.priority) {
            notification.priority = this.calculatePriority(notification);
        }

        // Add to queue
        this.notificationQueues[notification.priority].push({
            ...notification,
            timestamp: new Date().toISOString()
        });

        // Process queue based on priority
        await this.processQueueByPriority(notification.priority);
    }

    calculatePriority(notification) {
        // Default priorities for different notification types
        const priorityMap = {
            'flow-interruption': 1,
            'system-error': 1,
            'morning-brief': 2,
            'energy-check': 3,
            'pattern-recognition': 3,
            'content-update': 4,
            'general-update': 5
        };

        // Context-aware priority adjustment
        let basePriority = priorityMap[notification.type] || 3;
        
        // Adjust based on user's flow state
        if (this.isInDeepFlow()) {
            basePriority = Math.min(basePriority + 2, 5);
        }

        // Adjust based on content urgency
        if (notification.urgent) {
            basePriority = Math.max(basePriority - 1, 1);
        }

        return basePriority;
    }

    async processQueueByPriority(priority) {
        const queue = this.notificationQueues[priority];
        
        // Priority 1: Process immediately
        if (priority === 1) {
            while (queue.length > 0) {
                const notification = queue.shift();
                await this.deliverNotification(notification);
            }
            return;
        }

        // Other priorities: Set up batching
        if (this.preferences.batchingEnabled) {
            // Clear existing timer if any
            if (this.batchTimers[priority]) {
                clearTimeout(this.batchTimers[priority]);
            }

            // Set new timer for batch processing
            this.batchTimers[priority] = setTimeout(
                async () => {
                    await this.processBatch(priority);
                },
                this.priorityThresholds[priority]
            );
        }
    }

    async processBatch(priority) {
        const queue = this.notificationQueues[priority];
        if (queue.length === 0) return;

        // Group notifications by type
        const groupedNotifications = this.groupNotifications(queue);
        
        // Create batch notification for each group
        for (const [type, notifications] of groupedNotifications) {
            await this.deliverBatchNotification(type, notifications);
        }

        // Clear the queue
        this.notificationQueues[priority] = [];
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
        const batchNotification = {
            type: `${type}-batch`,
            timestamp: new Date().toISOString(),
            content: this.aggregateContent(notifications),
            count: notifications.length,
            summary: this.generateBatchSummary(notifications)
        };

        await this.deliverNotification(batchNotification);
    }

    aggregateContent(notifications) {
        // Combine similar content and remove duplicates
        const uniqueContent = new Set();
        notifications.forEach(notification => {
            if (typeof notification.content === 'string') {
                uniqueContent.add(notification.content);
            } else {
                uniqueContent.add(JSON.stringify(notification.content));
            }
        });

        return Array.from(uniqueContent).map(content => {
            try {
                return JSON.parse(content);
            } catch {
                return content;
            }
        });
    }

    generateBatchSummary(notifications) {
        return {
            totalCount: notifications.length,
            timeSpan: {
                start: notifications[0].timestamp,
                end: notifications[notifications.length - 1].timestamp
            },
            types: this.countTypes(notifications)
        };
    }

    countTypes(notifications) {
        return notifications.reduce((counts, notification) => {
            counts[notification.type] = (counts[notification.type] || 0) + 1;
            return counts;
        }, {});
    }

    async deliverNotification(notification) {
        if (this.shouldSuppress(notification)) {
            return;
        }

        // Format notification for delivery
        const formattedNotification = this.formatNotification(notification);
        
        // Store in history
        this.notificationHistory.push(formattedNotification);
        this.trimHistory();

        // Actual delivery (console.log for development)
        console.log(`🔔 [${notification.type}]:`, formattedNotification);
        
        this.lastNotification = formattedNotification;
        return formattedNotification;
    }

    shouldSuppress(notification) {
        // Check quiet hours
        if (this.isInQuietHours() && notification.priority > 1) {
            return true;
        }

        // Check flow state
        if (this.isInDeepFlow() && notification.priority > 2) {
            return true;
        }

        // Check for recent duplicates
        if (this.isDuplicate(notification)) {
            return true;
        }

        return false;
    }

    isInQuietHours() {
        if (!this.preferences.quietHours.enabled) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(this.preferences.quietHours.start.split(':')[0]);
        const endHour = parseInt(this.preferences.quietHours.end.split(':')[0]);

        if (startHour <= endHour) {
            return currentHour >= startHour && currentHour < endHour;
        } else {
            return currentHour >= startHour || currentHour < endHour;
        }
    }

    isInDeepFlow() {
        // Integration with FlowML system
        return flowML?.getCurrentFlowScore() > 80;
    }

    isDuplicate(notification) {
        // Check last 5 notifications for duplicates
        const recentNotifications = this.notificationHistory.slice(-5);
        return recentNotifications.some(recent => 
            recent.type === notification.type &&
            JSON.stringify(recent.content) === JSON.stringify(notification.content) &&
            Date.now() - new Date(recent.timestamp).getTime() < 300000 // 5 minutes
        );
    }

    formatNotification(notification) {
        return {
            id: this.generateNotificationId(),
            ...notification,
            formattedTimestamp: this.formatTimestamp(notification.timestamp)
        };
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    trimHistory() {
        // Keep last 1000 notifications
        if (this.notificationHistory.length > 1000) {
            this.notificationHistory = this.notificationHistory.slice(-1000);
        }
    }

    // Configuration methods
    updatePreferences(newPreferences) {
        this.preferences = {
            ...this.preferences,
            ...newPreferences
        };
    }

    setQuietHours(start, end) {
        this.preferences.quietHours = {
            enabled: true,
            start,
            end
        };
    }

    disableQuietHours() {
        this.preferences.quietHours.enabled = false;
    }

    setBatchInterval(milliseconds) {
        this.preferences.batchInterval = milliseconds;
    }

    getNotificationHistory(limit = 50) {
        return this.notificationHistory.slice(-limit);
    }
}

// Integration with QuantumKitchen
QuantumKitchen.prototype.notificationManager = new NotificationManager();