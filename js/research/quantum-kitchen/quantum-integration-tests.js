// test/integration/quantum-kitchen.integration.test.js
import { jest } from '@jest/globals';
import { QuantumKitchen } from '../../src/core/QuantumKitchen.js';
import { DriveConnector } from '../../src/core/DriveConnector.js';
import { FlowStateML } from '../../src/components/flow/FlowStateML.js';
import { SerendipityEngine } from '../../src/components/serendipity/SerendipityEngine.js';
import { ErrorManager } from '../../src/components/error/ErrorManager.js';
import { NotificationManager } from '../../src/components/notification/NotificationManager.js';
import { TagManager } from '../../src/components/tags/TagManager.js';

describe('Quantum Kitchen Integration', () => {
    let kitchen;
    let testContent;

    beforeAll(async () => {
        // Initialize kitchen with real components
        kitchen = new QuantumKitchen();
        await kitchen.initialize();

        // Create test content
        testContent = {
            id: 'test-content',
            type: 'article',
            content: 'Test content for integration',
            metadata: { author: 'test' }
        };
    });

    describe('Content Creation Flow', () => {
        test('should handle new content creation through all components', async () => {
            // Create content and track state changes
            const stateChanges = [];
            const insights = [];
            const notifications = [];

            // Listen for state changes
            kitchen.flowML.on('stateChange', (state) => stateChanges.push(state));
            kitchen.serendipityEngine.on('insight', (insight) => insights.push(insight));
            kitchen.notificationManager.on('notification', (notif) => notifications.push(notif));

            // Create content
            const fileId = await kitchen.drive.createFile(
                'test.txt',
                testContent.content,
                'creation',
                testContent.metadata
            );

            // Wait for all components to process
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify component interactions
            expect(stateChanges.length).toBeGreaterThan(0);
            expect(insights.length).toBeGreaterThan(0);
            expect(notifications.length).toBeGreaterThan(0);

            // Verify content state
            const contentState = await kitchen.drive.getFileContent(fileId);
            expect(contentState).toBeDefined();

            // Verify tags were created
            const contentTags = await kitchen.tagManager.getContentTags(fileId);
            expect(contentTags.length).toBeGreaterThan(0);
        });

        test('should maintain flow state during content operations', async () => {
            // Start in flow state
            await kitchen.flowML.updateState({ type: 'flow-support', impact: -0.2 });
            const initialFlow = kitchen.flowML.getCurrentState();

            // Perform content operations
            const operations = [];
            for (let i = 0; i < 3; i++) {
                operations.push(kitchen.drive.createFile(
                    `test${i}.txt`,
                    `Content ${i}`,
                    'creation',
                    { sequence: i }
                ));
            }

            await Promise.all(operations);

            // Verify flow state was protected
            const finalFlow = kitchen.flowML.getCurrentState();
            expect(finalFlow.score).toBeGreaterThanOrEqual(initialFlow.score * 0.8);
        });
    });

    describe('Quantum State Transitions', () => {
        test('should handle content state transitions correctly', async () => {
            // Create content in creation space
            const fileId = await kitchen.drive.createFile(
                'quantum-test.txt',
                'Quantum test content',
                'creation',
                { type: 'quantum-test' }
            );

            // Track quantum states
            const quantumStates = [];
            kitchen.tagManager.on('quantumStateChange', (state) => quantumStates.push(state));

            // Transition through spaces
            await kitchen.handleStateTransition({
                fileId,
                fromSpace: 'creation',
                toSpace: 'integration'
            });

            await kitchen.handleStateTransition({
                fileId,
                fromSpace: 'integration',
                toSpace: 'application'
            });

            // Verify quantum state transitions
            expect(quantumStates.length).toBeGreaterThan(1);
            expect(quantumStates[0].state).toBe('superposition');
            expect(quantumStates[quantumStates.length - 1].state).toBe('collapsed');
        });

        test('should handle entangled content correctly', async () => {
            // Create two related pieces of content
            const [fileId1, fileId2] = await Promise.all([
                kitchen.drive.createFile('entangled1.txt', 'Content 1', 'creation'),
                kitchen.drive.createFile('entangled2.txt', 'Content 2', 'creation')
            ]);

            // Create entanglement
            await kitchen.tagManager.createEntanglement(fileId1, fileId2);

            // Modify one content
            await kitchen.handleStateTransition({
                fileId: fileId1,
                fromSpace: 'creation',
                toSpace: 'integration'
            });

            // Verify entangled content was affected
            const state1 = await kitchen.tagManager.getQuantumState(fileId1);
            const state2 = await kitchen.tagManager.getQuantumState(fileId2);

            expect(state2.entanglement).toContain(fileId1);
            expect(state1.state).toBe(state2.state);
        });
    });

    describe('Pattern Recognition', () => {
        test('should discover patterns across content creation', async () => {
            // Create series of related content
            const contentSeries = [];
            for (let i = 0; i < 5; i++) {
                const fileId = await kitchen.drive.createFile(
                    `pattern${i}.txt`,
                    `Content with pattern ${i}`,
                    'creation',
                    { series: 'pattern-test' }
                );
                contentSeries.push(fileId);
            }

            // Track pattern discoveries
            const patterns = [];
            kitchen.serendipityEngine.on('patternDiscovered', (pattern) => patterns.push(pattern));

            // Allow pattern recognition to process
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify patterns were discovered
            expect(patterns.length).toBeGreaterThan(0);
            expect(patterns.some(p => p.confidence > 0.7)).toBe(true);
        });

        test('should generate insights from content relationships', async () => {
            // Create content with relationships
            const fileIds = await Promise.all([
                kitchen.drive.createFile('insight1.txt', 'Related content 1', 'creation'),
                kitchen.drive.createFile('insight2.txt', 'Related content 2', 'creation'),
                kitchen.drive.createFile('insight3.txt', 'Related content 3', 'creation')
            ]);

            // Add relationships
            await Promise.all(fileIds.map(async (id, i) => {
                if (i > 0) {
                    await kitchen.tagManager.addRelationship(fileIds[0], id, 0.8);
                }
            }));

            // Generate insights
            const insights = await kitchen.serendipityEngine.generateInsights(fileIds[0]);

            // Verify insights
            expect(insights.immediate.length).toBeGreaterThan(0);
            expect(insights.potential.length).toBeGreaterThan(0);
        });
    });

    describe('Error Recovery', () => {
        test('should recover from component errors while maintaining state', async () => {
            // Save initial system state
            const initialState = await kitchen.saveSystemState();

            // Simulate component error
            const error = new Error('Test error');
            await kitchen.errorManager.handleError(error, 'serendipityEngine');

            // Verify system continued functioning
            expect(kitchen.serendipityEngine.isOperational()).toBe(true);

            // Verify state was preserved
            const currentState = await kitchen.saveSystemState();
            expect(currentState.components).toMatchObject(initialState.components);
        });

        test('should maintain data consistency during errors', async () => {
            // Create content
            const fileId = await kitchen.drive.createFile(
                'error-test.txt',
                'Test content',
                'creation'
            );

            // Simulate error during state transition
            const transitionError = new Error('Transition error');
            jest.spyOn(kitchen.drive, 'moveFileToSpace')
                .mockRejectedValueOnce(transitionError);

            // Attempt state transition
            await expect(kitchen.handleStateTransition({
                fileId,
                fromSpace: 'creation',
                toSpace: 'integration'
            })).rejects.toThrow();

            // Verify content state remained consistent
            const contentState = await kitchen.drive.getFileContent(fileId);
            const tags = await kitchen.tagManager.getContentTags(fileId);
            
            expect(contentState).toBeDefined();
            expect(tags.some(t => t.category === 'status')).toBe(true);
        });
    });

    describe('System Performance', () => {
        test('should handle concurrent operations', async () => {
            // Create multiple concurrent operations
            const operations = [];
            for (let i = 0; i < 10; i++) {
                operations.push(kitchen.drive.createFile(
                    `concurrent${i}.txt`,
                    `Concurrent content ${i}`,
                    'creation'
                ));
            }

            // Execute concurrently
            const results = await Promise.all(operations);

            // Verify all operations completed
            expect(results).toHaveLength(10);
            expect(results.every(r => r)).toBe(true);
        });

        test('should maintain responsiveness under load', async () => {
            // Track response times
            const times = [];
            
            // Execute multiple operations
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                
                await kitchen.drive.createFile(
                    `load${i}.txt`,
                    `Load test content ${i}`,
                    'creation'
                );
                
                times.push(Date.now() - start);
            }

            // Verify performance remained consistent
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            const maxTime = Math.max(...times);
            
            expect(maxTime - avgTime).toBeLessThan(avgTime); // No significant spikes
        });
    });
});
