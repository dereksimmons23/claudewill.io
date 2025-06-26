// Test suite for Quantum Kitchen Integration
import { jest } from '@jest/globals';

// Mock implementations for core components
class MockFlowML {
    constructor() {
        this.flowScore = 50;
        this.onError = null;
        this.subscribers = new Set();
    }

    getCurrentState() {
        return { score: this.flowScore };
    }

    setFlowScore(score) {
        this.flowScore = score;
        this.notifySubscribers({ type: 'flow-change', score });
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    notifySubscribers(event) {
        this.subscribers.forEach(callback => callback(event));
    }

    async checkHealth() {
        return { status: 'healthy' };
    }
}

class MockSerendipityEngine {
    constructor() {
        this.onError = null;
        this.subscribers = new Set();
        this.patterns = new Map();
    }

    async processTagUpdate(update) {
        this.patterns.set(update.tag, update.patterns);
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    async checkHealth() {
        return { status: 'healthy' };
    }
}

class MockTagManager {
    constructor() {
        this.onError = null;
        this.tags = new Map();
    }

    async updateEnergyTags(state) {
        this.tags.set('energy', state.score > 80 ? 'high-focus' : 'medium-flow');
    }

    async processInsightTags(insight) {
        this.tags.set('insight', insight.tags);
    }

    async checkHealth() {
        return { status: 'healthy' };
    }
}

// Test suite
describe('QuantumKitchenIntegration', () => {
    let integration;
    let mockFlowML;
    let mockSerendipityEngine;
    let mockTagManager;
    let mockNotificationManager;
    let mockErrorManager;

    beforeEach(() => {
        // Initialize mocks
        mockFlowML = new MockFlowML();
        mockSerendipityEngine = new MockSerendipityEngine();
        mockTagManager = new MockTagManager();
        
        mockNotificationManager = {
            enqueueNotification: jest.fn(),
            adjustForFlowState: jest.fn(),
            hasRecentSimilar: jest.fn().mockReturnValue(false),
            setQuietMode: jest.fn(),
            suppressPatternNotifications: jest.fn(),
            suppressTagNotifications: jest.fn()
        };
        
        mockErrorManager = {
            handleError: jest.fn()
        };

        // Create integration instance with mocks
        integration = new QuantumKitchenIntegration();
        integration.flowML = mockFlowML;
        integration.serendipityEngine = mockSerendipityEngine;
        integration.tagManager = mockTagManager;
        integration.notificationManager = mockNotificationManager;
        integration.errorManager = mockErrorManager;
    });

    describe('Flow State Integration', () => {
        test('should adjust notifications when flow state changes', async () => {
            // Trigger flow state change
            mockFlowML.setFlowScore(85);

            // Check if notification manager was called
            expect(mockNotificationManager.adjustForFlowState)
                .toHaveBeenCalledWith({ type: 'flow-change', score: 85 });

            // Check if tag manager updated energy tags
            expect(mockTagManager.tags.get('energy')).toBe('high-focus');
        });

        test('should suppress notifications during deep flow', async () => {
            mockFlowML.setFlowScore(90);
            
            const event = {
                type: 'standard-update',
                priority: 3
            };

            const shouldNotify = integration.shouldNotify(event);
            expect(shouldNotify).toBe(false);
        });
    });

    describe('Serendipity Integration', () => {
        test('should process insights with correct priority', async () => {
            const insight = {
                confidence: 0.9,
                patternStrength: 0.8,
                tags: ['writing', 'flow']
            };

            await integration.integrationEvents.emit('newInsight', insight);

            // Check notification priority calculation
            expect(mockNotificationManager.enqueueNotification)
                .toHaveBeenCalledWith(expect.objectContaining({
                    type: 'insight',
                    priority: expect.any(Number)
                }));

            // Check tag processing
            expect(mockTagManager.tags.get('insight'))
                .toEqual(['writing', 'flow']);
        });

        test('should update serendipity patterns on tag changes', async () => {
            const tagUpdate = {
                tag: 'writing',
                patterns: ['morning-focus', 'creativity']
            };

            await integration.integrationEvents.emit('tagUpdate', tagUpdate);

            // Check if serendipity engine updated patterns
            expect(mockSerendipityEngine.patterns.get('writing'))
                .toEqual(['morning-focus', 'creativity']);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle flow ML errors appropriately', async () => {
            const error = new Error('Flow calculation failed');
            await mockFlowML.onError(error);

            // Check error manager called
            expect(mockErrorManager.handleError)
                .toHaveBeenCalledWith(error, 'FlowML');

            // Check system adjustments
            expect(mockNotificationManager.setQuietMode)
                .toHaveBeenCalledWith(true);
        });

        test('should handle serendipity errors with graceful degradation', async () => {
            const error = new Error('Pattern matching failed');
            await mockSerendipityEngine.onError(error);

            // Check error handling
            expect(mockErrorManager.handleError)
                .toHaveBeenCalledWith(error, 'SerendipityEngine');

            // Check notification adjustment
            expect(mockNotificationManager.suppressPatternNotifications)
                .toHaveBeenCalled();
        });
    });

    describe('Cross-Component Communication', () => {
        test('should calculate correct priorities for different events', () => {
            // Test flow event priority
            const flowEvent = {
                type: 'energy-critical',
                deltaScore: -25
            };
            expect(integration.calculateFlowPriority(flowEvent)).toBe(1);

            // Test insight priority
            const insight = {
                confidence: 0.9,
                patternStrength: 0.8
            };
            expect(integration.calculateInsightPriority(insight)).toBe(1);

            // Test serendipity priority
            const serendipityEvent = {
                connectionStrength: 0.9,
                timeSensitive: true
            };
            expect(integration.calculateSerendipityPriority(serendipityEvent)).toBe(1);
        });
    });

    describe('System Health Monitoring', () => {
        test('should track component health status', async () => {
            const health = await integration.checkSystemHealth();

            expect(health).toEqual({
                flowML: { status: 'healthy' },
                serendipityEngine: { status: 'healthy' },
                errorManager: { status: 'healthy' },
                notificationManager: { status: 'healthy' },
                tagManager: { status: 'healthy' }
            });
        });

        test('should update component status timestamps', async () => {
            const beforeCheck = Date.now();
            await integration.checkComponentHealth('flowML');
            const afterCheck = Date.now();

            const status = integration.componentStatus.get('flowML');
            expect(status.lastCheck).toBeGreaterThanOrEqual(beforeCheck);
            expect(status.lastCheck).toBeLessThanOrEqual(afterCheck);
        });
    });

    describe('Event Processing', () => {
        test('should filter notifications based on current system state', () => {
            mockFlowML.setFlowScore(50); // Normal flow state

            // Test standard event
            expect(integration.shouldNotify({
                type: 'standard',
                priority: 3
            })).toBe(true);

            // Test during deep flow
            mockFlowML.setFlowScore(85);
            expect(integration.shouldNotify({
                type: 'standard',
                priority: 3
            })).toBe(false);
        });
    });
});
