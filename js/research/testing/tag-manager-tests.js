// test/unit/components/tags/TagManager.test.js
import { jest } from '@jest/globals';
import { TagManager } from '../../../../src/components/tags/TagManager.js';
import { TagGraph } from '../../../../src/components/tags/TagGraph.js';
import { Analytics } from '../../../../src/utils/Analytics.js';

// Mock dependencies
jest.mock('../../../../src/components/tags/TagGraph.js');
jest.mock('../../../../src/utils/Analytics.js');

describe('TagManager', () => {
    let tagManager;
    let mockGraph;
    let mockAnalytics;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock graph
        mockGraph = new TagGraph();
        mockGraph.addRelationship = jest.fn();
        mockGraph.getAverageStrength = jest.fn();
        mockGraph.addNode = jest.fn();
        mockGraph.getMetrics = jest.fn();

        // Create mock analytics
        mockAnalytics = new Analytics();
        mockAnalytics.analyzeTransition = jest.fn();
        mockAnalytics.analyzeContent = jest.fn();

        // Initialize TagManager
        tagManager = new TagManager();
        tagManager.tagGraph = mockGraph;
        tagManager.analytics = mockAnalytics;
    });

    describe('Initialization', () => {
        test('should initialize with default tag categories', async () => {
            const result = await tagManager.initialize();
            
            expect(result).toBe(true);
            expect(tagManager.tags.status).toBeDefined();
            expect(tagManager.tags.quantum).toBeDefined();
            expect(tagManager.tags.energy).toBeDefined();
            expect(tagManager.tags.space).toBeDefined();
        });

        test('should initialize quantum states', async () => {
            await tagManager.initializeQuantumStates();
            
            expect(tagManager.quantumStates.size).toBe(0);
            expect(tagManager.patterns.quantum.size).toBe(0);
        });
    });

    describe('Tag Management', () => {
        beforeEach(async () => {
            await tagManager.initialize();
        });

        test('should add tag with proper metadata', async () => {
            const contentId = 'test123';
            const tag = 'in-progress';
            const category = 'status';
            const context = { source: 'user' };

            const result = await tagManager.addTag(contentId, tag, category, context);
            
            expect(result).toBe(true);
            expect(tagManager.contentTags.get(contentId)).toBeDefined();
            expect(mockGraph.addNode).toHaveBeenCalled();
        });

        test('should validate tags against categories', async () => {
            const validTag = {
                tag: 'in-progress',
                category: 'status'
            };

            const invalidTag = {
                tag: 'invalid-tag',
                category: 'status'
            };

            expect(tagManager.isValidTag(validTag.tag, validTag.category)).toBe(true);
            expect(tagManager.isValidTag(invalidTag.tag, invalidTag.category)).toBe(false);
        });

        test('should update tag relationships', async () => {
            const contentId = 'test123';
            const tagData = {
                tag: 'in-progress',
                category: 'status',
                quantumState: { state: 'superposition' }
            };

            await tagManager.updateTagRelationships(contentId, tagData);
            
            expect(mockGraph.addRelationship).toHaveBeenCalled();
        });
    });

    describe('Quantum State Management', () => {
        beforeEach(async () => {
            await tagManager.initialize();
        });

        test('should calculate quantum state', async () => {
            const contentId = 'test123';
            
            const state = await tagManager.calculateQuantumState(contentId);
            
            expect(state).toHaveProperty('state');
            expect(state).toHaveProperty('uncertainty');
            expect(state).toHaveProperty('entanglement');
        });

        test('should process quantum implications', async () => {
            const contentId = 'test123';
            const tagData = {
                tag: 'entangled',
                category: 'quantum'
            };

            await tagManager.processQuantumImplications(contentId, tagData);
            
            expect(tagManager.quantumStates.get(contentId)).toBeDefined();
        });

        test('should handle state collapse', async () => {
            const contentId = 'test123';
            const state = {
                state: 'superposition',
                entanglement: ['content456'],
                uncertainty: 0.8
            };

            tagManager.quantumStates.set(contentId, state);
            await tagManager.handleStateCollapse(contentId);
            
            const newState = tagManager.quantumStates.get(contentId);
            expect(newState.entanglement).toHaveLength(0);
            expect(newState.uncertainty).toBe(0);
        });
    });

    describe('Tag Suggestions', () => {
        beforeEach(async () => {
            await tagManager.initialize();
        });

        test('should generate tag suggestions', async () => {
            const contentId = 'test123';
            const context = { type: 'article' };

            mockAnalytics.analyzeContent.mockResolvedValue({
                patterns: ['pattern1'],
                significance: 0.8
            });

            const suggestions = await tagManager.suggestTags(contentId, context);
            
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.every(s => s.hasOwnProperty('score'))).toBe(true);
        });

        test('should rank suggestions by score', async () => {
            const suggestions = [
                { tag: 'tag1', confidence: 0.9 },
                { tag: 'tag2', confidence: 0.5 },
                { tag: 'tag3', confidence: 0.7 }
            ];

            const ranked = await tagManager.rankSuggestions(suggestions);
            
            expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
            expect(ranked[1].score).toBeGreaterThan(ranked[2].score);
        });

        test('should consider quantum state in suggestions', async () => {
            const contentId = 'test123';
            tagManager.quantumStates.set(contentId, {
                state: 'superposition',
                uncertainty: 0.8
            });

            const suggestions = await tagManager.suggestTags(contentId);
            
            expect(suggestions.some(s => s.category === 'quantum')).toBe(true);
        });
    });

    describe('Pattern Recognition', () => {
        beforeEach(async () => {
            await tagManager.initialize();
        });

        test('should update usage patterns', async () => {
            const tagData = {
                tag: 'in-progress',
                category: 'status',
                timestamp: new Date().toISOString()
            };

            await tagManager.updatePatterns(tagData);
            
            expect(tagManager.patterns.usage.has(tagData.tag)).toBe(true);
        });

        test('should update combination patterns', async () => {
            const contentId = 'test123';
            const tags = [
                { tag: 'in-progress', category: 'status' },
                { tag: 'article', category: 'content' }
            ];

            tagManager.contentTags.set(contentId, tags);
            await tagManager.updateCombinationPatterns(tags[0]);
            
            expect(tagManager.patterns.combinations.size).toBeGreaterThan(0);
        });

        test('should update quantum patterns', async () => {
            const tagData = {
                tag: 'entangled',
                category: 'quantum',
                quantumState: { state: 'superposition' }
            };

            await tagManager.updateQuantumPatterns(tagData);
            
            expect(tagManager.patterns.quantum.size).toBeGreaterThan(0);
        });
    });

    describe('Relationship Management', () => {
        beforeEach(async () => {
            await tagManager.initialize();
        });

        test('should calculate relationship strength', () => {
            const tag1 = {
                tag: 'in-progress',
                category: 'status',
                timestamp: new Date().toISOString(),
                quantumState: { state: 'superposition' }
            };

            const tag2 = {
                tag: 'article',
                category: 'content',
                timestamp: new Date().toISOString(),
                quantumState: { state: 'superposition' }
            };

            const strength = tagManager.calculateRelationshipStrength(tag1, tag2);
            
            expect(strength).toBeGreaterThan(0);
            expect(strength).toBeLessThanOrEqual(1);
        });

        test('should calculate quantum affinity', () => {
            const state1 = { state: 'superposition', uncertainty: 0.8 };
            const state2 = { state: 'superposition', uncertainty: 0.7 };

            const affinity = tagManager.calculateQuantumAffinity(state1, state2);
            
            expect(affinity).toBeGreaterThan(0);
            expect(affinity).toBeLessThanOrEqual(1);
        });
    });

    describe('Health Monitoring', () => {
        test('should report system health', async () => {
            mockGraph.getMetrics.mockReturnValue({
                nodes: 10,
                edges: 15
            });

            const health = await tagManager.checkHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('metrics');
            expect(health.metrics).toHaveProperty('totalTags');
            expect(health.metrics).toHaveProperty('relationships');
            expect(health.metrics).toHaveProperty('quantumStates');
            expect(health.metrics).toHaveProperty('patternMetrics');
        });

        test('should calculate pattern metrics', () => {
            const metrics = tagManager.getPatternMetrics();
            
            expect(metrics).toHaveProperty('usagePatterns');
            expect(metrics).toHaveProperty('combinationPatterns');
            expect(metrics).toHaveProperty('transitionPatterns');
            expect(metrics).toHaveProperty('quantumPatterns');
        });
    });
});

// Test TagGraph separately
describe('TagGraph', () => {
    let graph;

    beforeEach(() => {
        graph = new TagGraph();
    });

    test('should manage nodes and edges', () => {
        graph.addNode('tag1');
        graph.addNode('tag2');
        graph.addRelationship('tag1', 'tag2', 0.8);

        expect(graph.nodes.has('tag1')).toBe(true);
        expect(graph.nodes.has('tag2')).toBe(true);
        expect(graph.getWeight('tag1', 'tag2')).toBe(0.8);
    });

    test('should calculate average relationship strength', () => {
        graph.addNode('tag1');
        graph.addNode('tag2');
        graph.addNode('tag3');
        graph.addRelationship('tag1', 'tag2', 0.8);
        graph.addRelationship('tag1', 'tag3', 0.6);

        const avgStrength = graph.getAverageStrength('tag1');
        expect(avgStrength).toBe(0.7);
    });
});
