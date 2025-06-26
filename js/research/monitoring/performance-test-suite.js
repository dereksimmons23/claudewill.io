// test/performance/quantum-kitchen.perf.test.js
import { QuantumKitchen } from '../../src/core/QuantumKitchen.js';
import { performance } from 'perf_hooks';

describe('Quantum Kitchen Performance', () => {
    let kitchen;
    let metrics;

    beforeAll(async () => {
        kitchen = new QuantumKitchen();
        await kitchen.initialize();

        // Initialize metrics collection
        metrics = {
            contentCreation: [],
            stateTransitions: [],
            patternRecognition: [],
            quantumOperations: [],
            systemMemory: []
        };
    });

    afterEach(() => {
        // Record memory usage after each test
        metrics.systemMemory.push(process.memoryUsage());
    });

    afterAll(() => {
        // Output performance report
        console.log('Performance Test Results:', generateReport(metrics));
    });

    describe('Content Creation Performance', () => {
        test('should handle bulk content creation efficiently', async () => {
            const batchSizes = [10, 50, 100, 500];
            
            for (const size of batchSizes) {
                const startTime = performance.now();
                
                // Create content batch
                const promises = Array(size).fill().map((_, i) => 
                    kitchen.drive.createFile(
                        `perf_test_${i}.txt`,
                        `Performance test content ${i}`,
                        'creation',
                        { type: 'performance-test' }
                    )
                );

                await Promise.all(promises);
                
                const endTime = performance.now();
                metrics.contentCreation.push({
                    batchSize: size,
                    duration: endTime - startTime,
                    avgTimePerItem: (endTime - startTime) / size
                });

                // Verify system responsiveness
                expect(endTime - startTime).toBeLessThan(size * 100); // Less than 100ms per item
            }
        });

        test('should maintain pattern recognition speed with increasing content', async () => {
            const contentSizes = [5, 20, 50, 100];
            
            for (const size of contentSizes) {
                // Create related content
                const fileIds = await createRelatedContent(size);
                
                const startTime = performance.now();
                await kitchen.serendipityEngine.analyzeContent(fileIds);
                const endTime = performance.now();

                metrics.patternRecognition.push({
                    contentSize: size,
                    duration: endTime - startTime,
                    avgTimePerItem: (endTime - startTime) / size
                });

                // Verify pattern recognition remains efficient
                expect(endTime - startTime).toBeLessThan(size * 200); // Less than 200ms per item
            }
        });
    });

    describe('Quantum State Transition Performance', () => {
        test('should handle concurrent state transitions efficiently', async () => {
            const concurrencyLevels = [5, 20, 50, 100];
            
            for (const level of concurrencyLevels) {
                // Create test content
                const fileIds = await createTestContent(level);
                
                const startTime = performance.now();
                
                // Perform concurrent transitions
                const transitions = fileIds.map(id => 
                    kitchen.handleStateTransition({
                        fileId: id,
                        fromSpace: 'creation',
                        toSpace: 'integration'
                    })
                );

                await Promise.all(transitions);
                
                const endTime = performance.now();
                metrics.stateTransitions.push({
                    concurrencyLevel: level,
                    duration: endTime - startTime,
                    avgTimePerTransition: (endTime - startTime) / level
                });

                // Verify transition performance
                expect(endTime - startTime).toBeLessThan(level * 150); // Less than 150ms per transition
            }
        });

        test('should maintain quantum entanglement performance', async () => {
            const entanglementSizes = [2, 5, 10, 20];
            
            for (const size of entanglementSizes) {
                // Create entangled content group
                const fileIds = await createEntangledContent(size);
                
                const startTime = performance.now();
                
                // Perform quantum operation
                await kitchen.tagManager.processQuantumOperation(fileIds[0], {
                    type: 'state-change',
                    newState: 'integration'
                });
                
                const endTime = performance.now();
                metrics.quantumOperations.push({
                    entanglementSize: size,
                    duration: endTime - startTime,
                    avgTimePerItem: (endTime - startTime) / size
                });

                // Verify entanglement handling remains efficient
                expect(endTime - startTime).toBeLessThan(size * 300); // Less than 300ms per entangled item
            }
        });
    });

    describe('System Load Performance', () => {
        test('should handle mixed operations under load', async () => {
            const operations = [
                { type: 'create', count: 50 },
                { type: 'transition', count: 30 },
                { type: 'pattern', count: 20 },
                { type: 'quantum', count: 10 }
            ];

            const startTime = performance.now();
            
            // Execute mixed operations concurrently
            await Promise.all([
                executeBulkCreation(operations[0].count),
                executeBulkTransitions(operations[1].count),
                executeBulkPatternAnalysis(operations[2].count),
                executeBulkQuantumOperations(operations[3].count)
            ]);

            const endTime = performance.now();
            
            // Verify system performance under load
            const totalOperations = operations.reduce((sum, op) => sum + op.count, 0);
            expect(endTime - startTime).toBeLessThan(totalOperations * 200);
        });

        test('should maintain memory efficiency', async () => {
            const initialMemory = process.memoryUsage();
            
            // Perform memory-intensive operations
            await performMemoryIntensiveOperations();
            
            const finalMemory = process.memoryUsage();
            
            // Verify memory growth is reasonable
            expect(finalMemory.heapUsed - initialMemory.heapUsed)
                .toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
        });
    });

    // Helper functions
    async function createRelatedContent(size) {
        const fileIds = [];
        for (let i = 0; i < size; i++) {
            const fileId = await kitchen.drive.createFile(
                `related_${i}.txt`,
                `Related content ${i}`,
                'creation',
                { series: 'performance-test' }
            );
            fileIds.push(fileId);
        }
        return fileIds;
    }

    async function createEntangledContent(size) {
        const fileIds = await createRelatedContent(size);
        // Create entanglement relationships
        for (let i = 1; i < fileIds.length; i++) {
            await kitchen.tagManager.createEntanglement(fileIds[0], fileIds[i]);
        }
        return fileIds;
    }

    async function executeBulkCreation(count) {
        return Promise.all(
            Array(count).fill().map((_, i) => 
                kitchen.drive.createFile(
                    `bulk_${i}.txt`,
                    `Bulk content ${i}`,
                    'creation'
                )
            )
        );
    }

    async function executeBulkTransitions(count) {
        const fileIds = await createTestContent(count);
        return Promise.all(
            fileIds.map(id => 
                kitchen.handleStateTransition({
                    fileId: id,
                    fromSpace: 'creation',
                    toSpace: 'integration'
                })
            )
        );
    }

    async function executeBulkPatternAnalysis(count) {
        const fileIds = await createRelatedContent(count);
        return kitchen.serendipityEngine.analyzeContent(fileIds);
    }

    async function executeBulkQuantumOperations(count) {
        const fileIds = await createEntangledContent(count);
        return Promise.all(
            fileIds.map(id => 
                kitchen.tagManager.processQuantumOperation(id, {
                    type: 'entanglement-check'
                })
            )
        );
    }

    async function performMemoryIntensiveOperations() {
        // Create large content sets
        const contentSet1 = await createRelatedContent(100);
        const contentSet2 = await createEntangledContent(50);
        
        // Perform various operations
        await Promise.all([
            kitchen.serendipityEngine.analyzeContent(contentSet1),
            executeBulkTransitions(30),
            executeBulkQuantumOperations(20)
        ]);
    }

    function generateReport(metrics) {
        return {
            contentCreation: {
                averages: calculateAverages(metrics.contentCreation, 'batchSize'),
                trend: analyzeTrend(metrics.contentCreation, 'avgTimePerItem')
            },
            stateTransitions: {
                averages: calculateAverages(metrics.stateTransitions, 'concurrencyLevel'),
                trend: analyzeTrend(metrics.stateTransitions, 'avgTimePerTransition')
            },
            patternRecognition: {
                averages: calculateAverages(metrics.patternRecognition, 'contentSize'),
                trend: analyzeTrend(metrics.patternRecognition, 'avgTimePerItem')
            },
            quantumOperations: {
                averages: calculateAverages(metrics.quantumOperations, 'entanglementSize'),
                trend: analyzeTrend(metrics.quantumOperations, 'avgTimePerItem')
            },
            memoryUsage: analyzeMemoryUsage(metrics.systemMemory)
        };
    }

    function calculateAverages(data, groupBy) {
        const groups = {};
        data.forEach(item => {
            if (!groups[item[groupBy]]) {
                groups[item[groupBy]] = [];
            }
            groups[item[groupBy]].push(item.duration);
        });

        return Object.entries(groups).map(([key, values]) => ({
            [groupBy]: parseInt(key),
            avgDuration: values.reduce((a, b) => a + b) / values.length
        }));
    }

    function analyzeTrend(data, metric) {
        const values = data.map(item => item[metric]);
        const trend = values.reduce((a, b) => a + b) / values.length;
        return {
            average: trend,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    function analyzeMemoryUsage(memoryData) {
        return {
            heapGrowth: memoryData[memoryData.length - 1].heapUsed - memoryData[0].heapUsed,
            maxHeapUsed: Math.max(...memoryData.map(m => m.heapUsed)),
            avgHeapUsed: memoryData.reduce((a, b) => a + b.heapUsed, 0) / memoryData.length
        };
    }
});
