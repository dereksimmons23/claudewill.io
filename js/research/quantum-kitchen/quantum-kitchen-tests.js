// test/unit/core/QuantumKitchen.test.js
import { jest } from '@jest/globals';
import { QuantumKitchen } from '../../../src/core/QuantumKitchen.js';
import { DriveConnector } from '../../../src/core/DriveConnector.js';
import { FlowStateML } from '../../../src/components/flow/FlowStateML.js';
import { SerendipityEngine } from '../../../src/components/serendipity/SerendipityEngine.js';
import { ErrorManager } from '../../../src/components/error/ErrorManager.js';
import { NotificationManager } from '../../../src/components/notification/NotificationManager.js';
import { TagManager } from '../../../src/components/tags/TagManager.js';

// Mock implementations
jest.mock('../../../src/core/DriveConnector.js');
jest.mock('../../../src/components/flow/FlowStateML.js');
jest.mock('../../../src/components/serendipity/SerendipityEngine.js');
jest.mock('../../../src/components/error/ErrorManager.js');
jest.mock('../../../src/components/notification/NotificationManager.js');
jest.mock('../../../src/components/tags/TagManager.js');

describe('QuantumKitchen', () => {
    let kitchen;
    let mockDrive;
    let mockFlowML;
    let mockSerendipity;
    let mockError;
    let mockNotification;
    let mockTag;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Initialize mock implementations
        mockDrive = new DriveConnector();
        mockFlowML = new FlowStateML();
        mockSerendipity = new SerendipityEngine();
        mockError = new ErrorManager();
        mockNotification = new NotificationManager();
        mockTag = new TagManager();

        // Create QuantumKitchen instance
        kitchen = new QuantumKitchen({
            workspaces: {
                creation: 'test_creation',
                integration: 'test_integration',
                application: 'test_application',
                foundation: 'test_foundation'
            }
        });

        // Replace component instances with mocks
        kitchen.drive = mockDrive;
        kitchen.flowML = mockFlowML;
        kitchen.serendipityEngine = mockSerendipity;
        kitchen.errorManager = mockError;
        kitchen.notificationManager = mockNotification;
        kitchen.tagManager = mockTag;
    });

    describe('Initialization', () => {
        test('should initialize all components successfully', async () => {
            // Setup mock returns
            mockDrive.connectToDrive.mockResolvedValue(true);
            mockFlowML.initialize.mockResolvedValue(true);
            mockSerendipity.initialize.mockResolvedValue(true);
            mockError.initialize.mockResolvedValue(true);
            mockNotification.initialize.mockResolvedValue(true);
            mockTag.initialize.mockResolvedValue(true);

            // Test initialization
            const result = await kitchen.initialize();

            // Verify all components were initialized
            expect(result).toBe(true);
            expect(mockDrive.connectToDrive).toHaveBeenCalled();
            expect(mockFlowML.initialize).toHaveBeenCalled();
            expect(mockSerendipity.initialize).toHaveBeenCalled();
            expect(mockError.initialize).toHaveBeenCalled();
            expect(mockNotification.initialize).toHaveBeenCalled();
            expect(mockTag.initialize).toHaveBeenCalled();
        });

        test('should handle initialization failures gracefully', async () => {
            // Simulate drive connection failure
            mockDrive.connectToDrive.mockRejectedValue(new Error('Connection failed'));

            // Test initialization
            await expect(kitchen.initialize()).rejects.toThrow('Connection failed');

            // Verify error handling
            expect(mockError.handleError).toHaveBeenCalled();
        });
    });

    describe('Flow State Management', () => {
        test('should handle flow state changes correctly', async () => {
            const mockState = {
                score: 85,
                protection: true
            };

            // Simulate flow state change
            await kitchen.handleFlowStateChange(mockState);

            // Verify notifications were adjusted
            expect(mockNotification.adjustForFlowState).toHaveBeenCalledWith(mockState);
            
            // Verify tags were updated
            expect(mockTag.updateEnergyTags).toHaveBeenCalledWith(mockState);
        });

        test('should protect flow state during deep work', async () => {
            const mockState = {
                score: 95,
                protection: true
            };

            await kitchen.handleFlowStateChange(mockState);

            // Verify enhanced protection
            expect(mockNotification.setQuietMode).toHaveBeenCalledWith(true);
        });
    });

    describe('Content Management', () => {
        test('should handle new content creation correctly', async () => {
            const mockContent = {
                id: 'test123',
                type: 'article',
                space: 'creation'
            };

            // Setup mock responses
            mockDrive.createFile.mockResolvedValue(mockContent.id);
            mockSerendipity.analyzeContent.mockResolvedValue({
                patterns: [],
                significance: 0.8
            });

            // Test content creation
            const result = await kitchen.handleNewContent(mockContent);

            // Verify content handling
            expect(result).toBe(mockContent.id);
            expect(mockSerendipity.analyzeContent).toHaveBeenCalled();
            expect(mockTag.suggestTags).toHaveBeenCalled();
        });

        test('should handle content state transitions', async () => {
            const mockTransition = {
                fileId: 'test123',
                fromSpace: 'creation',
                toSpace: 'integration'
            };

            await kitchen.handleStateTransition(mockTransition);

            // Verify state transition handling
            expect(mockDrive.moveFileToSpace).toHaveBeenCalledWith(
                mockTransition.fileId,
                mockTransition.toSpace
            );
            expect(mockSerendipity.processTagUpdate).toHaveBeenCalled();
        });
    });

    describe('Pattern Recognition', () => {
        test('should process new patterns correctly', async () => {
            const mockPattern = {
                type: 'theme',
                confidence: 0.9,
                connections: []
            };

            await kitchen.handleNewPattern(mockPattern);

            // Verify pattern processing
            expect(mockSerendipity.processTagUpdate).toHaveBeenCalled();
            expect(mockTag.updateRelationships).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle component errors appropriately', async () => {
            const mockError = new Error('Test error');

            await kitchen.handleSystemError(mockError);

            // Verify error handling
            expect(mockError.handleError).toHaveBeenCalledWith(
                mockError,
                'QuantumKitchen'
            );
            expect(mockNotification.enqueueNotification).toHaveBeenCalled();
        });
    });

    describe('System Health', () => {
        test('should report accurate system health', async () => {
            // Setup mock health responses
            mockDrive.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockFlowML.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockSerendipity.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockError.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockNotification.checkHealth.mockResolvedValue({ status: 'healthy' });
            mockTag.checkHealth.mockResolvedValue({ status: 'healthy' });

            const health = await kitchen.checkSystemHealth();

            // Verify health check
            expect(health.status).toBe('healthy');
            expect(health.components).toHaveProperty('flowML');
            expect(health.components).toHaveProperty('serendipityEngine');
            expect(health.components).toHaveProperty('errorManager');
            expect(health.components).toHaveProperty('notificationManager');
            expect(health.components).toHaveProperty('tagManager');
        });

        test('should detect degraded system health', async () => {
            // Simulate component degradation
            mockFlowML.checkHealth.mockResolvedValue({ status: 'degraded' });

            const health = await kitchen.checkSystemHealth();

            // Verify degraded state detection
            expect(health.status).toBe('degraded');
            expect(mockNotification.enqueueNotification).toHaveBeenCalled();
        });
    });
});
