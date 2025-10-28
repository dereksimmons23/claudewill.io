// test/unit/components/notification/NotificationManager.test.js
import { jest } from '@jest/globals';
import { NotificationManager } from '../../../../src/components/notification/NotificationManager.js';
import { Analytics } from '../../../../src/utils/Analytics.js';

// Mock dependencies
jest.mock('../../../../src/utils/Analytics.js');

describe('NotificationManager', () => {
    let notificationManager;
    let mockAnalytics;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Create mock analytics
        mockAnalytics = new Analytics();
        mockAnalytics.analyzeSignificance = jest.fn();

        // Initialize NotificationManager
        notificationManager = new NotificationManager();
        notificationManager.analytics = mockAnalytics;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Initialization', () => {
        test('should initialize with default configuration', async () => {
            const result = await notificationManager.initialize();
            
            expect(result).toBe(true);
            expect(notificationManager.config.batchingEnabled).toBe(true);
            expect(notificationManager.queues).toBeDefined();
            expect(Object.keys(notificationManager.queues)).toHaveLength(5);
        });

        test('should set up batch timers', async () => {
            await notificationManager.initialize();
            
            expect(notificationManager.batchTimers[2]).toBeNull();
            expect(notificationManager.batchTimers[3]).toBeNull();
            expect(notificationManager.batchTimers[4]).toBeNull();
            expect(notificationManager.batchTimers[5]).toBeNull();
        });
    });

    describe('Notification Queueing', () => {
        beforeEach(async () => {
            await notificationManager.initialize();
        });

        test('should enqueue notification with correct priority', async () => {
            const notification = {
                type: 'test',
                content: 'Test notification',
                priority: 3
            };

            const id = await notificationManager.enqueueNotification(notification);
            
            expect(id).toBeDefined();
            expect(notificationManager.queues[3]).toHaveLength(1);
            expect(notificationManager.queues[3][0]).toMatchObject({
                type: 'test',
                content: 'Test notification'
            });
        });

        test('should calculate priority for unprioritized notifications', async () => {
            const notification = {
                type: 'test',
                content: 'Test notification'
            };

            mockAnalytics.analyzeSignificance.mockResolvedValue(0.8);

            const id = await notificationManager.enqueueNotification(notification);
            
            expect(id).toBeDefined();
            expect(notificationManager.queues[2]).toHaveLength(1); // High significance
        });

        test('should handle priority adjustments based on flow state', async () => {
            notificationManager.flowState = { score: 85 }; // Deep flow

            const notification = {
                type: 'test',
                content: 'Test notification'
            };

            await notificationManager.enqueueNotification(notification);
            
            // Should be in lower priority queue due to flow state
            expect(notificationManager.queues[4]).toHaveLength(1);
        });
    });

    describe('Batch Processing', () => {
        beforeEach(async () => {
            await notificationManager.initialize();
        });

        test('should batch notifications of same type', async () => {
            const notifications = [
                { type: 'test', content: 'Test 1', priority: 3 },
                { type: 'test', content: 'Test 2', priority: 3 },
                { type: 'test', content: 'Test 3', priority: 3 }
            ];

            for (const notification of notifications) {
                await notificationManager.enqueueNotification(notification);
            }

            await notificationManager.processBatch(3);
            
            expect(notificationManager.notificationHistory).toHaveLength(1);
            expect(notificationManager.notificationHistory[0].count).toBe(3);
        });

        test('should process batches based on priority delay', async () => {
            const notification = {
                type: 'test',
                content: 'Test notification',
                priority: 3
            };

            await notificationManager.enqueueNotification(notification);
            
            jest.advanceTimersByTime(notificationManager.getBatchDelay(3));
            
            expect(notificationManager.queues[3]).toHaveLength(0);
            expect(notificationManager.notificationHistory).toHaveLength(1);
        });

        test('should aggregate content in batches', () => {
            const notifications = [
                { content: 'Test 1' },
                { content: 'Test 2' },
                { content: 'Test 3' }
            ];

            const aggregated = notificationManager.aggregateContent(notifications);
            
            expect(aggregated).toHaveLength(3);
            expect(aggregated).toContain('Test 1');
            expect(aggregated).toContain('Test 2');
            expect(aggregated).toContain('Test 3');
        });
    });

    describe('Quantum State Handling', () => {
        beforeEach(async () => {
            await notificationManager.initialize();
        });

        test('should adjust notifications for quantum state', async () => {
            notificationManager.quantumState = {
                current: 'superposition',
                uncertainty: 0.8
            };

            const notification = {
                type: 'test',
                content: 'Test notification'
            };

            const adjusted = notificationManager.applyQuantumAdjustments(notification);
            
            expect(adjusted.quantumContext).toBeDefined();
            expect(adjusted.significance).toBeGreaterThan(notification.significance || 0);
        });

        test('should suppress notifications in sensitive quantum states', () => {
            notificationManager.quantumState = {
                current: 'superposition',
                sensitive: true
            };

            const notification = {
                type: 'test',
                priority: 3
            };

            const shouldSuppress = notificationManager.shouldSuppress(notification);
            expect(shouldSuppress).toBe(true);
        });
    });

    describe('Flow State Integration', () => {
        beforeEach(async () => {
            await notificationManager.initialize();
        });

        test('should update flow state and adjust notifications', async () => {
            const state = {
                score: 85,
                protection: true
            };

            await notificationManager.updateFlowState(state);
            
            expect(notificationManager.flowState).toEqual(state);
            // Check that active notifications were adjusted
            expect(notificationManager.queues[1]).toHaveLength(0);
        });

        test('should respect flow protection in deep states', async () => {
            notificationManager.flowState = {
                score: 95,
                protection: true
            };

            const notification = {
                type: 'test',
                priority: 3
            };

            const shouldSuppress = notificationManager.shouldSuppress(notification);
            expect(shouldSuppress).toBe(true);
        });
    });

    describe('Priority Calculations', () => {
        test('should calculate content-based priority', async () => {
            const notification = {
                type: 'content-update',
                content: { significance: 0.9 }
            };

            mockAnalytics.analyzeSignificance.mockResolvedValue(0.9);

            const priority = await notificationManager.calculatePriority(notification);
            expect(priority).toBeLessThanOrEqual(5);
            expect(priority).toBeGreaterThanOrEqual(1);
        });

        test('should adjust priority for system health', () => {
            notificationManager.systemHealth = 'critical';

            const priority = notificationManager.adjustPriorityForSystemHealth(3);
            expect(priority).toBeLessThan(3);
        });

        test('should adjust priority for quantum state', () => {
            notificationManager.quantumState = {
                stability: 0.3,
                transitioning: true
            };

            const priority = notificationManager.adjustPriorityForQuantumState(3);
            expect(priority).toBeLessThan(3);
        });
    });

    describe('Notification History', () => {
        test('should maintain notification history', async () => {
            const notification = {
                type: 'test',
                content: 'Test notification',
                priority: 1
            };

            await notificationManager.enqueueNotification(notification);
            await notificationManager.deliverNotification(notification);
            
            expect(notificationManager.notificationHistory).toHaveLength(1);
            expect(notificationManager.notificationHistory[0]).toMatchObject({
                type: 'test',
                content: 'Test notification'
            });
        });

        test('should limit history size', async () => {
            const notifications = Array(1100).fill().map((_, i) => ({
                type: 'test',
                content: `Test ${i}`,
                priority: 1
            }));

            for (const notification of notifications) {
                await notificationManager.deliverNotification(notification);
            }

            expect(notificationManager.notificationHistory.length)
                .toBeLessThanOrEqual(notificationManager.config.maxQueueSize);
        });
    });

    describe('Health Checks', () => {
        test('should report system health', async () => {
            const health = await notificationManager.checkHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('metrics');
            expect(health.metrics).toHaveProperty('queueSizes');
            expect(health.metrics).toHaveProperty('historySize');
        });

        test('should track queue sizes', async () => {
            await notificationManager.enqueueNotification({
                type: 'test',
                priority: 3
            });

            const health = await notificationManager.checkHealth();
            expect(health.metrics.queueSizes[3]).toBe(1);
        });
    });
});
