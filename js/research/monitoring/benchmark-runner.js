// test/benchmark/runBenchmarks.js
import { QuantumBenchmark } from './quantum-kitchen.benchmark.js';
import { BenchmarkReporter } from './reporters/BenchmarkReporter.js';
import cron from 'node-cron';

class BenchmarkRunner {
    constructor() {
        this.benchmark = new QuantumBenchmark();
        this.reporter = new BenchmarkReporter();
        this.isRunning = false;
    }

    async initialize() {
        await this.reporter.initialize();
        return true;
    }

    async runBenchmarkSuite() {
        if (this.isRunning) {
            console.log('Benchmark suite already running');
            return;
        }

        try {
            this.isRunning = true;
            console.log('Starting benchmark suite:', new Date().toISOString());

            // Run benchmarks
            const results = await this.benchmark.runBenchmarks();

            // Process and report results
            const report = await this.reporter.processResults(results);

            // Log completion
            console.log('Benchmark suite completed:', new Date().toISOString());
            console.log('Report status:', report.summary.status);

            if (report.summary.criticalIssues > 0) {
                console.error('Critical issues detected:', report.summary.criticalIssues);
            }

            return report;
        } catch (error) {
            console.error('Error running benchmark suite:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    scheduleDaily(time = '00:00') {
        // Schedule daily run
        cron.schedule(time, async () => {
            console.log('Running scheduled benchmark suite');
            try {
                await this.runBenchmarkSuite();
            } catch (error) {
                console.error('Scheduled benchmark run failed:', error);
            }
        });
    }

    scheduleWeekly(day = 0, time = '00:00') {
        // Schedule weekly run (day 0-6, where 0 is Sunday)
        const cronExpression = `${time.split(':')[1]} ${time.split(':')[0]} * * ${day}`;
        cron.schedule(cronExpression, async () => {
            console.log('Running weekly benchmark suite');
            try {
                await this.runBenchmarkSuite();
            } catch (error) {
                console.error('Weekly benchmark run failed:', error);
            }
        });
    }
}

// Run immediately if called directly
if (require.main === module) {
    const runner = new BenchmarkRunner();
    runner.initialize().then(() => {
        // Schedule daily benchmarks at 2 AM
        runner.scheduleDaily('02:00');
        
        // Schedule detailed weekly benchmarks on Sunday at 3 AM
        runner.scheduleWeekly(0, '03:00');
        
        console.log('Benchmark schedules initialized');
    }).catch(error => {
        console.error('Failed to initialize benchmark runner:', error);
        process.exit(1);
    });
}

export default BenchmarkRunner;