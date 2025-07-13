// test/unit/core/Integration.test.js
import { jest } from '@jest/globals';
import { Integration } from '../../../src/core/Integration.js';
import { EventEmitter } from '../../../src/utils/EventEmitter.js';

describe('Integration', () => {
    let integration;
    let mockKitchen;
    let mockDrive;
    let mockFlowML;
    let mockSerendipity;
    let mockError;
    let mockNotifications;
    let mockTags;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create mock components
        mockDrive = {
            on: jest.fn(),
            getFileContent: jest.fn(),
            moveFile: jest.fn(),
            searchFiles: jest.fn()
        };

        mockFlowML = {
            on: jest.fn(),
            assessContentImpact: jest.fn(),
            getCurrentState: jest.fn(),
            adjustForFlowImpact: jest.fn()
        };

        mockSerendipity = {
            on: jest.fn(),
            analyzeContent: jest.fn(),
            updateContentPatterns: jest.fn(),
            processTagUpdate: jest.fn(),
            analyzeTagPatterns: jest.fn()
        };

        mockError = {
            handleError: jest.fn(),
            attemptRecovery: jest.fn()
        };

        mockNotifications = {
            enqueueNotification: jest.fn(),
            adjustForFlowState: jest.fn(),
            setQuietMode: jest.fn(),
            suppressPatternNotifications: jest.fn()
        };

        mockTags = {
            on: jest.fn(),
            suggestTags: jest.fn(),
            addTags: jest.fn(),
            updateRelationships: jest.fn(),
            syncTags: jest.fn()
        };

        // Create mock kitchen with all components
        mockKitchen = {
            drive: mockDrive,
            flowML: mockFlowML,
            serendipityEngine: mockSerendipity,
            errorManager: mockError,
            notificationManager: mockNotifications,
            tagManager: mockTags
        };

        // Initialize integration layer
        integration = new Integration(mockKitchen);
    });

    describe('Initialization', () => {
        test('should initialize integration points correctly', () => {
            // Verify event listeners were set up
            expect(mockDrive.on).toHaveBeenCalledWith('fileCreated', expect.any(Function));
            expect(mockDrive.on).toHaveBeenCalledWith('fileMoved', expect.any(Function));
            expect(mockFlowML.on).toHaveBeenCalledWith('stateChange', expect.any(Function));
            expect(mockSerendipity.on).toHaveBeenCalledWith('patternDiscovered', expect.any(Function));
            expect(mockTags.on).toHaveBeenCalledWith('tagUpdate', expect.any(Function));
        });
    });

    describe('Content Integration', () => {
        test('should handle new content correctly', async () => {
            const mockEvent = {
                fileId: 'test123',
                metadata: { type: 'document' }
            };

            mockDrive.getFileContent.mockResolvedValue('test content');
            mockSerendipity.analyzeContent.mockResolvedValue({
                patterns: [],
                significance: 0.8
            });
            mockTags.suggestTags.mockResolvedValue(['tag1', 'tag2']);
            mockFlowML.assessContentImpact.mockResolvedValue({
                significant: true,
                impact: 0.7
            });

            await integration.handleNewContent(mockEvent);

            expect(mockSerendipity.analyzeContent).toHaveBeenCalled();
            expect(mockTags.suggestTags).toHaveBeenCalled();
            expect(mockTags.addTags).toHaveBeenCalled();
            expect(mockFlowML.assessContentImpact).toHaveBeenCalled();
            expect(mockFlowML.adjustForFlowImpact).toHaveBeenCalled();
        });

        test('should handle state transitions', async () => {
            const mockTransition = {
                fileId: 'test123',
                fromSpace: 'creation',
                toSpace: 'integration'
            };

            const mockValidation = {
                valid: true,
                reason: 'valid'
            };

            jest.spyOn(integration, 'validateTransition')
                .mockReturnValue(mockValidation);

            await integration.handleStateTransition(mockTransition);

            expect(mockDrive.moveFile).toHaveBeenCalledWith(
                mockTransition.fileId,
                mockTransition.toSpace
            );
            expect(mockSerendipity.processTagUpdate).toHaveBeenCalled();
            expect(mockNotifications.enqueueNotification).toHaveBeenCalled();
        });
    });

    describe('Flow State Integration', () => {
        test('should handle flow state changes', async () => {
            const mockState = {
                score: 85,
                protection: true
            };

            mockDrive.searchFiles.mockResolvedValue([
                { id: 'file1' },
                { id: 'file2' }
            ]);

            await integration.handleFlowStateChange(mockState);

            expect(mockNotifications.adjustForFlowState).toHaveBeenCalledWith(mockState);
            expect(mockTags.updateRelationships).toHaveBeenCalled();
            expect(mockSerendipity.updateContentPatterns).toHaveBeenCalled();
        });

        test('should protect deep flow states', async () => {
            const mockState = {
                score: 95,
                protection: true
            };

            await integration.handleFlowStateChange(mockState);

            expect(mockNotifications.setQuietMode).toHaveBeenCalledWith(true);
        });
    });

    describe('Pattern Integration', () => {
        test('should handle new patterns', async () => {
            const mockPattern = {
                type: 'theme',
                confidence: 0.9,
                connections: []
            };

            mockDrive.searchFiles.mockResolvedValue([
                { id: 'file1' },
                { id: 'file2' }
            ]);

            await integration.handleNewPattern(mockPattern);

            expect(mockSerendipity.processTagUpdate).toHaveBeenCalled();
            expect(mockTags.updateRelationships).toHaveBeenCalled();
            expect(mockNotifications.enqueueNotification).toHaveBeenCalled();
        });
    });

    describe('Tag Integration', () => {
        test('should handle tag updates', async () => {
            const mockUpdate = {
                tags: ['tag1', 'tag2'],
                contentId: 'test123'
            };

            mockSerendipity.analyzeTagPatterns.mockResolvedValue({
                relationships: [
                    { source: 'tag1', target: 'tag2', strength: 0.8 }
                ]
            });

            await integration.handleTagUpdate(mockUpdate);

            expect(mockSerendipity.analyzeTagPatterns).toHaveBeenCalled();
            expect(mockSerendipity.updateContentPatterns).toHaveBeenCalled();
        });
    });

    describe('Error Integration', () => {
        test('should handle component errors', async () => {
            const mockError = new Error('Test error');

            await integration.handleError(mockError, 'FlowML');

            expect(mockError.handleError).toHaveBeenCalledWith(mockError, 'FlowML');
            expect(mockNotifications.enqueueNotification).toHaveBeenCalled();
        });

        test('should attempt recovery for errors', async () => {
            const mockError = new Error('Recoverable error');
            mockError.handleError.mockResolvedValue(true);

            await integration.handleError(mockError, 'SerendipityEngine');

            expect(mockError.attemptRecovery).toHaveBeenCalled();
        });
    });

    describe('State Validation', () => {
        test('should validate state transitions correctly', () => {
            const validTransition = integration.validateTransition(
                'creation',
                'integration'
            );
            expect(validTransition.valid).toBe(true);

            const invalidTransition = integration.validateTransition(
                'creation',
                'foundation'
            );
            expect(invalidTransition.valid).toBe(false);
        });
    });

    describe('Priority Calculations', () => {
        test('should calculate content priorities correctly', () => {
            const mockAnalysis = {
                significance: 0.9,
                urgency: 0.8
            };

            mockFlowML.getCurrentState.mockReturnValue({ score: 50 });

            const priority = integration.calculateContentPriority(mockAnalysis);
            expect(priority).toBeLessThanOrEqual(5);
            expect(priority).toBeGreaterThanOrEqual(1);
        });

        test('should calculate pattern priorities correctly', () => {
            const mockPattern = {
                significance: 0.9,
                novelty: 0.8,
                reliability: 0.9
            };

            const priority = integration.calculatePatternPriority(mockPattern);
            expect(priority).toBeLessThanOrEqual(5);
            expect(priority).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Cross-Component Communication', () => {
        test('should maintain event consistency', async () => {
            const eventEmitter = new EventEmitter();
            const events = [];

            // Track all emitted events
            eventEmitter.on('*', (event) => events.push(event));

            const mockEvent = {
                fileId: 'test123',
                type: 'stateChange'
            };

            await integration.handleNewContent(mockEvent);
            await integration.handleStateTransition(mockEvent);
            await integration.handleNewPattern({ type: 'theme' });

            expect(events).toHaveLength(expect.any(Number));
            expect(events.some(e => e.type === 'stateChange')).toBe(true);
        });
    });
});
