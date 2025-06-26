// test/unit/components/flow/FlowStateML.test.js
import { jest } from '@jest/globals';
import { FlowStateML } from '../../../../src/components/flow/FlowStateML.js';
import { Analytics } from '../../../../src/utils/Analytics.js';

// Mock Analytics
jest.mock('../../../../src/utils/Analytics.js');

describe('FlowStateML', () => {
    let flowML;
    let mockAnalytics;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mock analytics
        mockAnalytics = new Analytics();
        mockAnalytics.analyzeTransition = jest.fn();
        mockAnalytics.analyzeContent = jest.fn();
        
        // Initialize FlowStateML
        flowML = new FlowStateML();
        flowML.analytics = mockAnalytics;
    });

    describe('Initialization', () => {
        test('should initialize with default state', async () => {
            const result = await flowML.initialize();
            
            expect(result).toBe(true);
            expect(flowML.currentState).toEqual(expect.objectContaining({
                score: 100,
                protection: true,
                phase: 'preparation'
            }));
        });

        test('should load historical patterns', async () => {
            jest.spyOn(flowML, 'loadPatterns').mockResolvedValue(true);
            
            await flowML.initialize();
            
            expect(flowML.loadPatterns).toHaveBeenCalled();
            expect(flowML.patterns.timeOfDay).toBeDefined();
            expect(flowML.patterns.sessionLength).toBeDefined();
        });
    });

    describe('State Management', () => {
        beforeEach(async () => {
            await flowML.initialize();
        });

        test('should update state based on events', async () => {
            const event = {
                type: 'interruption',
                impact: 0.5
            };

            jest.spyOn(flowML, 'calculateEventImpact')
                .mockResolvedValue(15);

            const newState = await flowML.updateState(event);
            
            expect(newState.score).toBeLessThan(100);
            expect(newState.interruptions).toHaveLength(1);
        });

        test('should transition through phases correctly', async () => {
            // Simulate multiple state updates
            const events = [
                { type: 'interruption', impact: 0.3 },
                { type: 'flow-support', impact: -0.2 },
                { type: 'context-switch', impact: 0.4 }
            ];

            for (const event of events) {
                await flowML.updateState(event);
            }

            expect(flowML.currentState.phase).toBeDefined();
            expect(Object.keys(flowML.flowPhases)).toContain(flowML.currentState.phase);
        });

        test('should protect deep flow states', async () => {
            // Set up deep flow state
            flowML.currentState.score = 85;
            flowML.currentState.phase = 'deep';

            const event = {
                type: 'notification',
                impact: 0.3
            };

            const impact = await flowML.calculateEventImpact(event);
            
            expect(impact).toBeGreaterThan(
                flowML.getBaseImpact(event)
            );
        });
    });

    describe('Pattern Learning', () => {
        beforeEach(async () => {
            await flowML.initialize();
        });

        test('should learn from state transitions', async () => {
            const previousState = { ...flowML.currentState };
            const event = {
                type: 'interruption',
                impact: 0.5
            };

            await flowML.learnFromTransition(previousState, flowML.currentState, event);
            
            expect(mockAnalytics.analyzeTransition).toHaveBeenCalled();
            expect(flowML.patterns.timeOfDay.size).toBeGreaterThan(0);
        });

        test('should update time patterns', async () => {
            const event = {
                type: 'interruption',
                impact: 0.5
            };

            await flowML.applyTimePatterns(event);
            
            const hour = new Date().getHours();
            expect(flowML.patterns.timeOfDay.has(hour)).toBe(true);
        });

        test('should update energy patterns', async () => {
            const event = {
                type: 'energy-drop',
                impact: 0.6
            };

            await flowML.applyEnergyPatterns(event);
            
            expect(flowML.patterns.energyLevels.size).toBeGreaterThan(0);
        });
    });

    describe('Content Analysis', () => {
        beforeEach(async () => {
            await flowML.initialize();
        });

        test('should assess content impact', async () => {
            const content = {
                id: 'test123',
                type: 'article',
                complexity: 0.7
            };

            mockAnalytics.analyzeContent.mockResolvedValue({
                complexity: 0.7,
                engagement: 0.8,
                relevance: 0.9
            });

            const assessment = await flowML.assessContentImpact(content);
            
            expect(assessment).toHaveProperty('impact');
            expect(assessment).toHaveProperty('significant');
            expect(mockAnalytics.analyzeContent).toHaveBeenCalledWith(content);
        });

        test('should calculate content complexity', () => {
            const content = {
                type: 'article',
                text: 'Complex technical content'
            };

            const complexity = flowML.calculateComplexity(content);
            
            expect(complexity).toBeGreaterThanOrEqual(0);
            expect(complexity).toBeLessThanOrEqual(1);
        });

        test('should analyze content timing', () => {
            const timing = flowML.assessTiming();
            
            expect(timing).toBeGreaterThanOrEqual(0);
            expect(timing).toBeLessThanOrEqual(1);
        });
    });

    describe('Interruption Handling', () => {
        beforeEach(async () => {
            await flowML.initialize();
        });

        test('should log interruptions correctly', () => {
            const event = {
                type: 'interruption',
                source: 'notification'
            };

            flowML.logInterruption(event, 15);
            
            expect(flowML.interruptionLog).toHaveLength(1);
            expect(flowML.currentState.interruptions).toHaveLength(1);
        });

        test('should calculate interruption impact based on phase', async () => {
            flowML.currentState.phase = 'deep';
            
            const event = {
                type: 'interruption',
                source: 'notification'
            };

            const impact = await flowML.calculateEventImpact(event);
            
            expect(impact).toBeGreaterThan(flowML.getBaseImpact(event));
        });
    });

    describe('Energy Management', () => {
        beforeEach(async () => {
            await flowML.initialize();
        });

        test('should track energy markers', async () => {
            await flowML.updateEnergyMarkers();
            
            expect(flowML.currentState.energyMarkers).toHaveLength(1);
            expect(flowML.currentState.energyMarkers[0]).toHaveProperty('score');
            expect(flowML.currentState.energyMarkers[0]).toHaveProperty('phase');
        });

        test('should generate energy insights', async () => {
            mockAnalytics.analyzeTransition.mockResolvedValue({
                confidence: 0.9,
                patterns: ['energy-peak', 'focus-time']
            });

            const insights = await flowML.generateInsights({
                from: { score: 80 },
                to: { score: 90 },
                event: { type: 'flow-support' }
            });
            
            expect(insights).toHaveProperty('significant');
            expect(mockAnalytics.analyzeTransition).toHaveBeenCalled();
        });
    });

    describe('Session Management', () => {
        test('should calculate session length correctly', () => {
            flowML.currentState.startTime = new Date(Date.now() - 3600000); // 1 hour ago
            
            const length = flowML.getSessionLength();
            
            expect(length).toBeCloseTo(60, 0); // 60 minutes
        });

        test('should handle session shutdown', async () => {
            await flowML.startSession();
            await flowML.updateState({ type: 'interruption' });
            
            const summary = await flowML.shutdown();
            
            expect(summary).toHaveProperty('startTime');
            expect(summary).toHaveProperty('endTime');
            expect(summary).toHaveProperty('finalScore');
            expect(summary).toHaveProperty('interruptions');
        });
    });

    describe('Health Monitoring', () => {
        test('should report health metrics', async () => {
            const health = await flowML.checkHealth();
            
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('metrics');
            expect(health.metrics).toHaveProperty('sessionLength');
            expect(health.metrics).toHaveProperty('currentScore');
            expect(health.metrics).toHaveProperty('phase');
        });
    });
});
