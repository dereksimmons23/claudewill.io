// test/unit/components/error/ErrorManager.test.js
import { jest } from '@jest/globals';
import { ErrorManager } from '../../../../src/components/error/ErrorManager.js';
import { Analytics } from '../../../../src/utils/Analytics.js';

// Mock dependencies
jest.mock('../../../../src/utils/Analytics.js');

describe('ErrorManager', () => {
    let errorManager;
    let mockAnalytics;
    let mockDrive;
    let mockFlowML;
    let mockSerendipityEngine;
    let mockNotificationManager;
    let mockTagManager;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock analytics
        mockAnalytics = new Analytics();
        mockAnalytics.analyzeRecoveryPattern = jest.fn();

        // Create mock components
        mockDrive = {
            reconnect: jest.fn(),
            saveSystemState: jest.fn()
        };

        mockFlowML = {
            getState: jest.fn(),
            pauseProcessing: jest.fn(),
            checkHealth: jest.fn()
        };

        mockSerendipityEngine = {
            getState: jest.fn(),
            resetPatternAnalysis: jest.fn(),
            checkHealth: jest.fn()
        };

        mockNotificationManager = {
            enqueueNotification: jest.fn(),
            checkHealth: jest.fn()
        };

        mockTagManager = {
            getState: jest.fn(),
            syncTags: jest.fn(),
            checkHealth: jest.fn()
        };

        // Initialize ErrorManager
        errorManager = new ErrorManager();
        errorManager.analytics = mockAnalytics;
    });

    describe('Initialization', () => {
        test('should initialize with recovery strategies', async () => {
            await errorManager.initialize();
            
            expect(errorManager.recoveryStrategies.size).toBeGreaterThan(0);
            expect(errorManager.stateSnapshots).toBeDefined();
        });

        test('should load error patterns', async () => {
            const result = await errorManager.initialize();
            
            expect(result).toBe(true);
            expect(mockAnalytics.analyzeRecoveryPattern).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should handle component errors', async () => {
            const error = new Error('Test error');
            const component = 'flowML';

            const result = await errorManager.handleError(error, component);
            
            expect(result).toBe(false); // No recovery strategy
            expect(errorManager.errorLog).toHaveLength(1);
        });

        test('should normalize errors correctly', () => {
            const error = new Error('Test error');
            const component = 'flowML';

            const normalized = errorManager.normalizeError(error, component);
            
            expect(normalized).toHaveProperty('code');
            expect(normalized).toHaveProperty('component');
            expect(normalized).toHaveProperty('timestamp');
        });

        test('should determine correct error codes', () => {
            const errors = [
                { error: new Error('Flow error'), component: 'flowML', expected: 'FLOW_INTERRUPTION' },
                { error: new Error('Drive error'), component: 'driveConnector', expected: 'DRIVE_CONNECTION_ERROR' },
                { error: new Error('Pattern error'), component: 'serendipityEngine', expected: 'PATTERN_RECOGNITION_ERROR' }
            ];

            errors.forEach(({ error, component, expected }) => {
                const code = errorManager.determineErrorCode(error, component);
                expect(code).toBe(expected);
            });
        });
    });

    describe('Recovery Strategies', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should attempt flow state recovery', async () => {
            const error = {
                code: 'FLOW_INTERRUPTION',
                component: 'flowML'
            };

            mockFlowML.checkHealth.mockResolvedValue({ status: 'healthy' });
            
            const recovered = await errorManager.attemptRecovery(error);
            
            expect(recovered).toBe(true);
            expect(mockFlowML.pauseProcessing).toHaveBeenCalled();
        });

        test('should handle drive connection errors', async () => {
            const error = {
                code: 'DRIVE_CONNECTION_ERROR',
                component: 'driveConnector'
            };

            mockDrive.reconnect.mockResolvedValue(true);
            
            const recovered = await errorManager.attemptRecovery(error);
            
            expect(recovered).toBe(true);
            expect(mockDrive.reconnect).toHaveBeenCalled();
        });

        test('should handle pattern recognition errors', async () => {
            const error = {
                code: 'PATTERN_RECOGNITION_ERROR',
                component: 'serendipityEngine'
            };

            const recovered = await errorManager.attemptRecovery(error);
            
            expect(recovered).toBe(true);
            expect(mockSerendipityEngine.resetPatternAnalysis).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should take state snapshots', async () => {
            const component = 'flowML';
            mockFlowML.getState.mockResolvedValue({ score: 85, protection: true });

            await errorManager.takeStateSnapshot(component);
            
            expect(errorManager.stateSnapshots.has(component)).toBe(true);
            expect(errorManager.stateSnapshots.get(component)).toHaveProperty('state');
            expect(errorManager.stateSnapshots.get(component)).toHaveProperty('timestamp');
        });

        test('should preserve system state during errors', async () => {
            const error = new Error('Critical error');
            
            await errorManager.saveSystemState();
            
            expect(mockDrive.saveSystemState).toHaveBeenCalled();
        });
    });

    describe('Error Escalation', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should escalate unrecoverable errors', async () => {
            const error = {
                code: 'CRITICAL_ERROR',
                component: 'system'
            };

            await errorManager.escalateError(error);
            
            expect(mockNotificationManager.enqueueNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error-escalation',
                    priority: 1
                })
            );
        });

        test('should initiate emergency recovery for critical errors', async () => {
            const error = new Error('System failure');
            
            await errorManager.initiateEmergencyRecovery(error);
            
            expect(mockDrive.saveSystemState).toHaveBeenCalled();
            expect(mockNotificationManager.enqueueNotification).toHaveBeenCalled();
        });
    });

    describe('Recovery Pattern Learning', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should learn from successful recoveries', async () => {
            const error = {
                code: 'FLOW_INTERRUPTION',
                component: 'flowML'
            };

            await errorManager.updateRecoveryPatterns(error, true);
            
            expect(mockAnalytics.analyzeRecoveryPattern).toHaveBeenCalledWith(
                expect.objectContaining({
                    error,
                    successful: true
                })
            );
        });

        test('should update strategy effectiveness', async () => {
            const errorCode = 'FLOW_INTERRUPTION';
            
            await errorManager.updateStrategyEffectiveness(errorCode, true);
            
            const strategy = errorManager.recoveryStrategies.get(errorCode);
            expect(strategy).toBeDefined();
        });
    });

    describe('Health Monitoring', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should check system health', async () => {
            mockFlowML.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockSerendipityEngine.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockNotificationManager.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockTagManager.checkHealth.mockResolvedValue({ status: 'healthy' });

            const health = await errorManager.checkSystemHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('components');
            expect(health.status).toBe('healthy');
        });

        test('should detect degraded system health', async () => {
            mockFlowML.checkHealth.mockResolvedValue({ status: 'degraded' });
            mockSerendipityEngine.checkHealth.mockResolvedValue({ status: 'healthy' });

            const health = await errorManager.checkSystemHealth();
            
            expect(health.status).toBe('degraded');
        });

        test('should detect critical system health', async () => {
            mockFlowML.checkHealth.mockResolvedValue({ status: 'critical' });

            const health = await errorManager.checkSystemHealth();
            
            expect(health.status).toBe('critical');
            expect(mockNotificationManager.enqueueNotification).toHaveBeenCalled();
        });
    });

    describe('Graceful Degradation', () => {
        beforeEach(async () => {
            await errorManager.initialize();
        });

        test('should handle graceful degradation', async () => {
            const error = {
                code: 'DRIVE_CONNECTION_ERROR',
                component: 'driveConnector'
            };

            await errorManager.degradeGracefully(error);
            
            expect(mockNotificationManager.enqueueNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'system-degradation'
                })
            );
        });

        test('should maintain basic functionality during degradation', async () => {
            await errorManager.enableBasicMode();
            
            expect(mockFlowML.pauseProcessing).toHaveBeenCalled();
            expect(mockSerendipityEngine.resetPatternAnalysis).toHaveBeenCalled();
        });
    });
});
