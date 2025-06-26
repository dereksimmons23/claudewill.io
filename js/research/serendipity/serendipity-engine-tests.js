// test/unit/components/serendipity/SerendipityEngine.test.js
import { jest } from '@jest/globals';
import { SerendipityEngine } from '../../../../src/components/serendipity/SerendipityEngine.js';
import { Analytics } from '../../../../src/utils/Analytics.js';
import { WeightedGraph } from '../../../../src/components/serendipity/WeightedGraph.js';

// Mock dependencies
jest.mock('../../../../src/utils/Analytics.js');
jest.mock('../../../../src/components/serendipity/WeightedGraph.js');

describe('SerendipityEngine', () => {
    let serendipityEngine;
    let mockAnalytics;
    let mockGraph;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock analytics
        mockAnalytics = new Analytics();
        mockAnalytics.analyzeTransition = jest.fn();
        mockAnalytics.analyzeContent = jest.fn();

        // Create mock graph
        mockGraph = new WeightedGraph();
        mockGraph.addNode = jest.fn();
        mockGraph.addEdge = jest.fn();
        mockGraph.getWeight = jest.fn();
        mockGraph.getNeighbors = jest.fn();

        // Initialize SerendipityEngine
        serendipityEngine = new SerendipityEngine();
        serendipityEngine.analytics = mockAnalytics;
        serendipityEngine.relationships = mockGraph;
    });

    describe('Initialization', () => {
        test('should initialize with default settings', async () => {
            const result = await serendipityEngine.initialize();
            
            expect(result).toBe(true);
            expect(serendipityEngine.settings.minConfidence).toBeDefined();
            expect(serendipityEngine.settings.quantumThreshold).toBeDefined();
        });

        test('should initialize quantum states', async () => {
            await serendipityEngine.initializeQuantumStates();
            
            expect(serendipityEngine.patterns.quantum.size).toBe(0);
            expect(serendipityEngine.contentStates.size).toBe(0);
        });
    });

    describe('Content Analysis', () => {
        beforeEach(async () => {
            await serendipityEngine.initialize();
        });

        test('should analyze content comprehensively', async () => {
            const content = {
                id: 'test123',
                text: 'Test content',
                metadata: { type: 'article' }
            };

            const analysis = await serendipityEngine.analyzeContent(content);
            
            expect(analysis).toHaveProperty('patterns');
            expect(analysis).toHaveProperty('quantumStates');
            expect(analysis).toHaveProperty('connections');
            expect(analysis).toHaveProperty('insights');
        });

        test('should extract thematic patterns', async () => {
            const content = 'Test content with specific themes';

            jest.spyOn(serendipityEngine, 'extractConcepts')
                .mockResolvedValue(new Set(['concept1', 'concept2']));

            const patterns = await serendipityEngine.extractThematicPatterns(content);
            
            expect(Array.isArray(patterns)).toBe(true);
            expect(patterns.some(p => p.concept)).toBe(true);
        });

        test('should extract quantum patterns', async () => {
            const content = {
                id: 'test123',
                states: ['creation', 'integration']
            };

            const patterns = await serendipityEngine.extractQuantumPatterns(content);
            
            expect(Array.isArray(patterns)).toBe(true);
            expect(patterns.some(p => p.type === 'quantum-pattern')).toBe(true);
        });
    });

    describe('Connection Discovery', () => {
        beforeEach(async () => {
            await serendipityEngine.initialize();
        });

        test('should find direct connections', async () => {
            const patterns = {
                themes: [{ concept: 'test', strength: 0.8 }],
                temporal: [],
                contextual: [],
                quantum: []
            };

            const connections = await serendipityEngine.findDirectConnections(patterns);
            
            expect(Array.isArray(connections)).toBe(true);
        });

        test('should find quantum connections', async () => {
            const patterns = {
                quantum: [{ 
                    states: ['creation'],
                    probability: 0.9
                }]
            };
            const states = ['creation', 'integration'];

            const connections = await serendipityEngine.findQuantumConnections(
                patterns,
                states
            );
            
            expect(Array.isArray(connections)).toBe(true);
            expect(connections.some(c => c.type === 'quantum')).toBe(true);
        });

        test('should analyze quantum connection strength', async () => {
            const pattern = {
                states: ['creation'],
                probability: 0.9
            };
            const state = {
                state: 'creation',
                probability: 0.8
            };

            const connection = await serendipityEngine.analyzeQuantumConnection(
                pattern,
                state
            );
            
            expect(connection).toHaveProperty('strength');
            expect(connection.strength).toBeGreaterThan(0);
        });
    });

    describe('Insight Generation', () => {
        beforeEach(async () => {
            await serendipityEngine.initialize();
        });

        test('should generate comprehensive insights', async () => {
            const patterns = {
                themes: [{ concept: 'test', strength: 0.8 }],
                quantum: [{ states: ['creation'], probability: 0.9 }]
            };
            const connections = [
                { type: 'direct', strength: 0.7 },
                { type: 'quantum', strength: 0.9 }
            ];

            const insights = await serendipityEngine.generateInsights(
                patterns,
                connections
            );
            
            expect(insights).toHaveProperty('immediate');
            expect(insights).toHaveProperty('emerging');
            expect(insights).toHaveProperty('quantum');
            expect(insights).toHaveProperty('potential');
        });

        test('should analyze quantum insights', async () => {
            const patterns = {
                quantum: [{ 
                    states: ['creation'],
                    probability: 0.9
                }]
            };
            const connections = [
                { type: 'quantum', strength: 0.9 }
            ];

            const insights = await serendipityEngine.analyzeQuantumInsights(
                patterns,
                connections
            );
            
            expect(Array.isArray(insights)).toBe(true);
            expect(insights.some(i => i.type === 'quantum-insight')).toBe(true);
        });

        test('should calculate quantum confidence', () => {
            const transition = {
                states: ['creation', 'integration'],
                probability: 0.9
            };
            const implications = [
                { confidence: 0.8, impact: 'high' },
                { confidence: 0.7, impact: 'medium' }
            ];

            const confidence = serendipityEngine.calculateQuantumConfidence(
                transition,
                implications
            );
            
            expect(confidence).toBeGreaterThan(0);
            expect(confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('Pattern Processing', () => {
        test('should process tag updates', async () => {
            const update = {
                tags: ['tag1', 'tag2'],
                connections: [{ source: 'tag1', target: 'tag2', strength: 0.8 }]
            };

            await serendipityEngine.processTagUpdate(update);
            
            expect(mockGraph.addEdge).toHaveBeenCalled();
        });

        test('should update content patterns', async () => {
            const contentId = 'test123';
            const patterns = {
                themes: [{ concept: 'test', strength: 0.8 }],
                quantum: [{ states: ['creation'], probability: 0.9 }]
            };

            const result = await serendipityEngine.updateContentPatterns(
                contentId,
                patterns
            );
            
            expect(result).toBe(true);
            expect(mockGraph.addNode).toHaveBeenCalled();
        });
    });

    describe('Quantum State Management', () => {
        test('should track quantum states', async () => {
            const contentId = 'test123';
            const state = {
                current: 'creation',
                probability: 0.9,
                entangled: []
            };

            await serendipityEngine.updateQuantumState(contentId, state);
            
            expect(serendipityEngine.contentStates.get(contentId)).toBeDefined();
            expect(serendipityEngine.contentStates.get(contentId).current)
                .toBe('creation');
        });

        test('should handle quantum transitions', async () => {
            const contentId = 'test123';
            const fromState = 'creation';
            const toState = 'integration';

            const transition = await serendipityEngine.handleQuantumTransition(
                contentId,
                fromState,
                toState
            );
            
            expect(transition).toHaveProperty('probability');
            expect(transition).toHaveProperty('implications');
        });
    });

    describe('Health Monitoring', () => {
        test('should report system health', async () => {
            const health = await serendipityEngine.checkHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('metrics');
            expect(health.metrics).toHaveProperty('patterns');
            expect(health.metrics).toHaveProperty('relationships');
        });
    });
});

// Test WeightedGraph separately
describe('WeightedGraph', () => {
    let graph;

    beforeEach(() => {
        graph = new WeightedGraph();
    });

    test('should add nodes and edges', () => {
        graph.addNode('node1');
        graph.addNode('node2');
        graph.addEdge('node1', 'node2', 0.8);

        expect(graph.nodes.has('node1')).toBe(true);
        expect(graph.nodes.has('node2')).toBe(true);
        expect(graph.getWeight('node1', 'node2')).toBe(0.8);
    });

    test('should track relationships', () => {
        graph.addNode('node1');
        graph.addNode('node2');
        graph.addEdge('node1', 'node2', 0.8);

        const neighbors = graph.getNeighbors('node1');
        expect(neighbors.has('node2')).toBe(true);
    });

    test('should report size metrics', () => {
        graph.addNode('node1');
        graph.addNode('node2');
        graph.addEdge('node1', 'node2', 0.8);

        const size = graph.size();
        expect(size.nodes).toBe(2);
        expect(size.edges).toBe(1);
    });
});
