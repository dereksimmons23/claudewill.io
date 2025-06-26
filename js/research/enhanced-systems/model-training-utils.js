// deployment/recovery/models/training/ModelTrainer.js
class ModelTrainer {
    constructor() {
        this.trainingConfig = {
            batchSize: 32,
            epochs: 10,
            validationSplit: 0.2,
            learningRateDecay: 0.95,
            minLearningRate: 0.001
        };

        this.metrics = {
            training: new Map(),
            validation: new Map(),
            performance: new Map()
        };
    }

    async trainModel(model, trainingData, options = {}) {
        const config = { ...this.trainingConfig, ...options };
        const trainingId = `training_${Date.now()}`;

        try {
            // Initialize training session
            await this.initializeTraining(model, trainingId);

            // Process data
            const processedData = await this.preprocessData(trainingData);
            const [trainSet, validationSet] = this.splitData(processedData, config.validationSplit);

            // Train through epochs
            for (let epoch = 0; epoch < config.epochs; epoch++) {
                const batchResults = await this.trainEpoch(model, trainSet, config.batchSize);
                const validationResults = await this.validateEpoch(model, validationSet);

                // Update metrics
                this.updateMetrics(trainingId, epoch, batchResults, validationResults);

                // Adjust learning rate
                this.adjustLearningRate(model, epoch, validationResults);

                // Check early stopping
                if (this.shouldStopEarly(trainingId)) {
                    console.log('Early stopping triggered');
                    break;
                }
            }

            // Final validation
            const finalPerformance = await this.evaluateModel(model, validationSet);
            
            return {
                trainingId,
                metrics: this.metrics,
                finalPerformance
            };

        } catch (error) {
            console.error('Training failed:', error);
            throw error;
        }
    }

    async preprocessData(data) {
        return {
            features: await this.normalizeFeatures(data.features),
            labels: await this.processLabels(data.labels),
            metadata: data.metadata
        };
    }

    async normalizeFeatures(features) {
        const normalized = {};
        for (const [key, values] of Object.entries(features)) {
            normalized[key] = this.normalize(values);
        }
        return normalized;
    }

    normalize(values) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return values.map(v => (v - min) / (max - min));
    }

    splitData(data, validationSplit) {
        const splitIndex = Math.floor(data.features.length * (1 - validationSplit));
        
        return [
            {
                features: data.features.slice(0, splitIndex),
                labels: data.labels.slice(0, splitIndex)
            },
            {
                features: data.features.slice(splitIndex),
                labels: data.labels.slice(splitIndex)
            }
        ];
    }

    async trainEpoch(model, trainSet, batchSize) {
        const batches = this.createBatches(trainSet, batchSize);
        const results = [];

        for (const batch of batches) {
            const batchResult = await this.trainBatch(model, batch);
            results.push(batchResult);
        }

        return this.aggregateResults(results);
    }

    createBatches(data, batchSize) {
        const batches = [];
        for (let i = 0; i < data.features.length; i += batchSize) {
            batches.push({
                features: data.features.slice(i, i + batchSize),
                labels: data.labels.slice(i, i + batchSize)
            });
        }
        return batches;
    }

    async trainBatch(model, batch) {
        const predictions = await model.predict(batch.features);
        const loss = this.calculateLoss(predictions, batch.labels);
        await model.update(loss);
        return { loss, predictions };
    }

    calculateLoss(predictions, labels) {
        // Mean squared error
        return predictions.reduce((sum, pred, i) => {
            const diff = pred - labels[i];
            return sum + (diff * diff);
        }, 0) / predictions.length;
    }

    async validateEpoch(model, validationSet) {
        const predictions = await model.predict(validationSet.features);
        return {
            loss: this.calculateLoss(predictions, validationSet.labels),
            accuracy: this.calculateAccuracy(predictions, validationSet.labels)
        };
    }

    calculateAccuracy(predictions, labels) {
        const correct = predictions.filter((pred, i) => 
            Math.abs(pred - labels[i]) < 0.1
        ).length;
        return correct / predictions.length;
    }

    updateMetrics(trainingId, epoch, batchResults, validationResults) {
        if (!this.metrics.training.has(trainingId)) {
            this.metrics.training.set(trainingId, []);
            this.metrics.validation.set(trainingId, []);
        }

        this.metrics.training.get(trainingId).push({
            epoch,
            ...batchResults
        });

        this.metrics.validation.get(trainingId).push({
            epoch,
            ...validationResults
        });
    }

    adjustLearningRate(model, epoch, validationResults) {
        if (epoch > 0) {
            const currentLR = model.learningRate;
            const newLR = Math.max(
                currentLR * this.trainingConfig.learningRateDecay,
                this.trainingConfig.minLearningRate
            );
            model.learningRate = newLR;
        }
    }

    shouldStopEarly(trainingId) {
        const validationMetrics = this.metrics.validation.get(trainingId);
        if (validationMetrics.length < 3) return false;

        // Check if validation loss is increasing for 3 consecutive epochs
        const recentLosses = validationMetrics.slice(-3).map(m => m.loss);
        return recentLosses[0] < recentLosses[1] && recentLosses[1] < recentLosses[2];
    }

    async evaluateModel(model, testData) {
        const predictions = await model.predict(testData.features);
        
        return {
            loss: this.calculateLoss(predictions, testData.labels),
            accuracy: this.calculateAccuracy(predictions, testData.labels),
            predictions
        };
    }

    getTrainingMetrics(trainingId) {
        return {
            training: this.metrics.training.get(trainingId),
            validation: this.metrics.validation.get(trainingId)
        };
    }

    getModelPerformance(trainingId) {
        return this.metrics.performance.get(trainingId);
    }
}

export default ModelTrainer;