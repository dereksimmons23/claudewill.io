// src/core/QuantumKitchen.js
import { DriveConnector } from './DriveConnector.js';
import { FlowStateML } from '../components/flow/FlowStateML.js';
import { SerendipityEngine } from '../components/serendipity/SerendipityEngine.js';
import { ErrorManager } from '../components/error/ErrorManager.js';
import { NotificationManager } from '../components/notification/NotificationManager.js';
import { TagManager } from '../components/tags/TagManager.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class QuantumKitchen {
    constructor(config = {}) {
        // Core configuration
        this.config = {
            workspaces: {
                creation: 'Creation_Space',
                integration: 'Integration_Space',
                application: 'Application_Space',
                foundation: 'Foundation_Space'
            },
            ...config
        };

        // Initialize core components
        this.events = new EventEmitter();
        this.drive = new DriveConnector(this.config.driveConfig);
        
        // Initialize enhanced components
        this.flowML = new FlowStateML();
        this.serendipityEngine = new SerendipityEngine();
        this.errorManager = new ErrorManager();
        this.notificationManager = new NotificationManager();
        this.tagManager = new TagManager();

        // System state
        this.state = {
            initialized: false,
            currentSpace: null,
            flowProtection: false,
            activeConnections: new Set()
        };

        // Bind event handlers
        this.bindEventHandlers();
    }

    async initialize() {
        try {
            // Initialize drive connection
            await this.drive.connectToDrive();
            await this.validateWorkspaces();

            // Initialize enhanced components
            await this.initializeComponents();

            // Set up system monitoring
            this.startSystemMonitoring();

            this.state.initialized = true;
            await this.notificationManager.enqueueNotification({
                type: 'system',
                content: 'Quantum Kitchen initialized successfully',
                priority: 2
            });

            return true;
        } catch (error) {
            await this.errorManager.handleError(error, 'QuantumKitchen');
            throw error;
        }
    }

    async initializeComponents() {
        // Start flow protection
        await this.flowML.initialize();
        this.state.flowProtection = true;

        // Initialize pattern recognition
        await this.serendipityEngine.initialize();

        // Set up tag system
        await this.tagManager.initialize();

        // Configure notification priorities
        await this.notificationManager.initialize();
    }

    bindEventHandlers() {
        // Flow state changes
        this.flowML.on('stateChange', async (state) => {
            await this.handleFlowStateChange(state);
        });

        // Serendipity insights
        this.serendipityEngine.on('insight', async (insight) => {
            await this.handleNewInsight(insight);
        });

        // Tag updates
        this.tagManager.on('update', async (update) => {
            await this.handleTagUpdate(update);
        });

        // Error events
        this.errorManager.on('error', async (error) => {
            await this.handleSystemError(error);
        });
    }

    async handleFlowStateChange(state) {
        try {
            // Update system state
            this.state.flowProtection = state.protection;

            // Adjust notifications
            await this.notificationManager.adjustForFlowState(state);

            // Update tags
            await this.tagManager.updateEnergyTags(state);

            // Log state change
            this.events.emit('flowStateChange', state);
        } catch (error) {
            await this.errorManager.handleError(error, 'FlowStateHandler');
        }
    }

    async handleNewInsight(insight) {
        try {
            // Process insight
            const processedInsight = await this.serendipityEngine.processInsight(insight);

            // Create tags from insight
            await this.tagManager.processInsightTags(processedInsight);

            // Notify if significant
            if (processedInsight.significance > 0.7) {
                await this.notificationManager.enqueueNotification({
                    type: 'insight',
                    content: processedInsight,
                    priority: this.calculateInsightPriority(processedInsight)
                });
            }

            // Log insight
            this.events.emit('newInsight', processedInsight);
        } catch (error) {
            await this.errorManager.handleError(error, 'InsightHandler');
        }
    }

    async handleTagUpdate(update) {
        try {
            // Update serendipity patterns
            await this.serendipityEngine.processTagUpdate(update);

            // Check for significant changes
            if (update.significant) {
                await this.notificationManager.enqueueNotification({
                    type: 'tag-update',
                    content: update,
                    priority: 3
                });
            }

            // Log update
            this.events.emit('tagUpdate', update);
        } catch (error) {
            await this.errorManager.handleError(error, 'TagHandler');
        }
    }

    async handleSystemError(error) {
        try {
            // Log error
            console.error('System error:', error);

            // Notify admin
            await this.notificationManager.enqueueNotification({
                type: 'system-error',
                content: error,
                priority: 1
            });

            // Attempt recovery
            await this.errorManager.attemptRecovery(error);

            // Log error event
            this.events.emit('systemError', error);
        } catch (recoveryError) {
            // If recovery fails, initiate shutdown
            await this.initiateEmergencyShutdown(recoveryError);
        }
    }

    async validateWorkspaces() {
        for (const [name, path] of Object.entries(this.config.workspaces)) {
            const exists = await this.drive.checkWorkspace(path);
            if (!exists) {
                await this.drive.createWorkspace(path);
            }
        }
    }

    startSystemMonitoring() {
        setInterval(async () => {
            const health = await this.checkSystemHealth();
            if (health.status !== 'healthy') {
                await this.handleHealthIssue(health);
            }
        }, 60000); // Check every minute
    }

    async checkSystemHealth() {
        const health = {
            flowML: await this.flowML.checkHealth(),
            serendipityEngine: await this.serendipityEngine.checkHealth(),
            errorManager: await this.errorManager.checkHealth(),
            notificationManager: await this.notificationManager.checkHealth(),
            tagManager: await this.tagManager.checkHealth()
        };

        return {
            status: this.calculateOverallHealth(health),
            components: health
        };
    }

    calculateOverallHealth(health) {
        return Object.values(health).every(h => h.status === 'healthy')
            ? 'healthy'
            : 'degraded';
    }

    calculateInsightPriority(insight) {
        let priority = 3; // Default priority

        // Adjust based on current flow state
        const flowState = this.flowML.getCurrentState();
        if (flowState.score > 80) {
            priority += 1; // Lower priority during deep flow
        }

        // Adjust based on insight confidence
        if (insight.confidence > 0.8) {
            priority -= 1; // Higher priority for high-confidence insights
        }

        // Adjust based on pattern strength
        if (insight.patternStrength > 0.7) {
            priority -= 1; // Higher priority for strong patterns
        }

        return Math.max(1, Math.min(5, priority)); // Ensure within 1-5 range
    }

    async handleHealthIssue(health) {
        const degradedComponents = Object.entries(health.components)
            .filter(([_, status]) => status.status !== 'healthy')
            .map(([name]) => name);

        await this.notificationManager.enqueueNotification({
            type: 'health-alert',
            content: {
                status: health.status,
                degradedComponents
            },
            priority: 2
        });
    }

    async initiateEmergencyShutdown(error) {
        console.error('Initiating emergency shutdown:', error);
        
        try {
            // Save system state
            await this.saveSystemState();

            // Notify of shutdown
            await this.notificationManager.enqueueNotification({
                type: 'emergency-shutdown',
                content: {
                    error,
                    timestamp: new Date().toISOString()
                },
                priority: 1
            });

            // Shutdown components
            await this.shutdownComponents();

        } catch (shutdownError) {
            console.error('Error during emergency shutdown:', shutdownError);
        } finally {
            process.exit(1);
        }
    }

    async saveSystemState() {
        const state = {
            timestamp: new Date().toISOString(),
            components: {
                flowML: await this.flowML.getState(),
                serendipityEngine: await this.serendipityEngine.getState(),
                tagManager: await this.tagManager.getState()
            },
            activeConnections: Array.from(this.state.activeConnections)
        };

        await this.drive.saveSystemState(state);
    }

    async shutdownComponents() {
        // Shutdown in reverse initialization order
        await this.notificationManager.shutdown();
        await this.tagManager.shutdown();
        await this.serendipityEngine.shutdown();
        await this.flowML.shutdown();
        await this.drive.disconnect();
    }
}

// Export for use in index.js
export default QuantumKitchen;