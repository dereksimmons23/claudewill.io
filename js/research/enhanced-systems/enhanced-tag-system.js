class TagManager {
    constructor() {
        // Base tag categories
        this.tagCategories = {
            status: new TagCategory('status', ['draft', 'in-progress', 'ready-for-integration']),
            content: new TagCategory('content', ['article', 'framework', 'reflection']),
            priority: new TagCategory('priority', ['urgent', 'next-up', 'backburner']),
            energy: new TagCategory('energy', ['high-focus', 'medium-flow', 'low-energy']),
            space: new TagCategory('space', ['creation', 'integration', 'application', 'foundation'])
        };

        // Tag relationships and analytics
        this.tagRelationships = new Map();
        this.tagUsageStats = new Map();
        this.tagGraph = new TagGraph();
        
        // Tag history for analytics
        this.tagHistory = [];
        
        // Initialize analytics engine
        this.analytics = new TagAnalytics(this);
    }

    async addTag(fileId, tag, category) {
        try {
            // Validate tag
            if (!this.isValidTag(tag, category)) {
                throw new KitchenError('Invalid tag', 'INVALID_TAG', { tag, category });
            }

            // Add tag to file
            const metadata = {
                tag,
                category,
                timestamp: new Date().toISOString()
            };

            await driveConnector.addFileTag(fileId, metadata);
            
            // Update analytics
            this.recordTagUsage(tag, category, fileId);
            
            // Update relationships
            await this.updateTagRelationships(fileId);
            
            return true;
        } catch (error) {
            await errorManager.handleError(error, 'TagManager');
            return false;
        }
    }

    async updateTagRelationships(fileId) {
        const fileTags = await this.getFileTags(fileId);
        
        // Update tag co-occurrence
        for (let i = 0; i < fileTags.length; i++) {
            for (let j = i + 1; j < fileTags.length; j++) {
                this.tagGraph.addRelationship(fileTags[i], fileTags[j]);
            }
        }
    }

    recordTagUsage(tag, category, fileId) {
        const usage = {
            tag,
            category,
            fileId,
            timestamp: new Date().toISOString()
        };

        this.tagHistory.push(usage);
        this.updateTagStats(tag, category);
    }

    updateTagStats(tag, category) {
        const key = `${category}:${tag}`;
        const currentStats = this.tagUsageStats.get(key) || {
            count: 0,
            lastUsed: null,
            frequency: {}
        };

        // Update basic stats
        currentStats.count++;
        currentStats.lastUsed = new Date().toISOString();

        // Update frequency by hour
        const hour = new Date().getHours();
        currentStats.frequency[hour] = (currentStats.frequency[hour] || 0) + 1;

        this.tagUsageStats.set(key, currentStats);
    }

    async suggestTags(fileContent, metadata) {
        try {
            // Get content-based suggestions
            const contentSuggestions = await this.analyzeContentForTags(fileContent);
            
            // Get context-based suggestions
            const contextSuggestions = await this.analyzeContextForTags(metadata);
            
            // Get relationship-based suggestions
            const relationshipSuggestions = this.tagGraph.suggestRelatedTags(
                [...contentSuggestions, ...contextSuggestions]
            );
            
            // Merge and rank suggestions
            return this.rankTagSuggestions([
                ...contentSuggestions,
                ...contextSuggestions,
                ...relationshipSuggestions
            ]);
        } catch (error) {
            await errorManager.handleError(error, 'TagManager');
            return [];
        }
    }

    async analyzeContentForTags(content) {
        // Content analysis for tag suggestions
        const suggestions = new Set();
        
        // Check content type patterns
        for (const [pattern, tag] of this.contentPatterns) {
            if (content.match(pattern)) {
                suggestions.add({ tag, confidence: 0.8, source: 'content' });
            }
        }
        
        // Analyze semantic meaning
        const semanticTags = await this.analyzeSemanticTags(content);
        semanticTags.forEach(tag => suggestions.add(tag));
        
        return Array.from(suggestions);
    }

    async analyzeSemanticTags(content) {
        // Placeholder for semantic analysis
        return [];
    }

    async analyzeContextForTags(metadata) {
        const suggestions = new Set();
        
        // Check file location
        if (metadata.path) {
            const spaceTag = this.determineSpaceFromPath(metadata.path);
            if (spaceTag) {
                suggestions.add({ tag: spaceTag, confidence: 1, source: 'space' });
            }
        }
        
        // Check timestamp patterns
        if (metadata.modifiedTime) {
            const timeBasedTags = this.analyzeTimePatterns(metadata.modifiedTime);
            timeBasedTags.forEach(tag => suggestions.add(tag));
        }
        
        return Array.from(suggestions);
    }

    rankTagSuggestions(suggestions) {
        return suggestions
            .map(suggestion => ({
                ...suggestion,
                score: this.calculateTagScore(suggestion)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10 suggestions
    }

    calculateTagScore(suggestion) {
        let score = suggestion.confidence || 0.5;
        
        // Factor in tag usage frequency
        const stats = this.tagUsageStats.get(`${suggestion.category}:${suggestion.tag}`);
        if (stats) {
            score *= 1 + (stats.count / 1000); // Usage bonus
        }
        
        // Factor in relationship strength
        const relationshipStrength = this.tagGraph.getRelationshipStrength(suggestion.tag);
        if (relationshipStrength) {
            score *= 1 + (relationshipStrength / 10);
        }
        
        return score;
    }

    async getTagAnalytics(category = null) {
        return this.analytics.generateReport(category);
    }

    async cleanupTags() {
        // Remove unused tags
        const unusedTags = await this.findUnusedTags();
        for (const tag of unusedTags) {
            await this.removeTag(tag);
        }
        
        // Merge similar tags
        await this.mergeSimilarTags();
        
        // Update relationships
        await this.rebuildRelationships();
    }

    async mergeSimilarTags() {
        const similarPairs = await this.findSimilarTags();
        for (const [tag1, tag2] of similarPairs) {
            await this.mergeTags(tag1, tag2);
        }
    }
}

class TagCategory {
    constructor(name, validTags) {
        this.name = name;
        this.validTags = new Set(validTags);
    }

    isValid(tag) {
        return this.validTags.has(tag);
    }

    addValidTag(tag) {
        this.validTags.add(tag);
    }

    removeValidTag(tag) {
        this.validTags.delete(tag);
    }
}

class TagGraph {
    constructor() {
        this.nodes = new Map(); // Tags
        this.edges = new Map(); // Relationships
    }

    addRelationship(tag1, tag2, weight = 1) {
        // Ensure nodes exist
        this.addNode(tag1);
        this.addNode(tag2);
        
        // Add or update edge
        const edgeKey = this.getEdgeKey(tag1, tag2);
        const currentWeight = this.edges.get(edgeKey) || 0;
        this.edges.set(edgeKey, currentWeight + weight);
    }

    addNode(tag) {
        if (!this.nodes.has(tag)) {
            this.nodes.set(tag, {
                connections: new Set(),
                weight: 0
            });
        }
    }

    getEdgeKey(tag1, tag2) {
        return [tag1, tag2].sort().join('::');
    }

    getRelationshipStrength(tag1, tag2) {
        const edgeKey = this.getEdgeKey(tag1, tag2);
        return this.edges.get(edgeKey) || 0;
    }

    suggestRelatedTags(tags, limit = 5) {
        const suggestions = new Map();
        
        for (const tag of tags) {
            const node = this.nodes.get(tag);
            if (node) {
                for (const connection of node.connections) {
                    const strength = this.getRelationshipStrength(tag, connection);
                    const current = suggestions.get(connection) || 0;
                    suggestions.set(connection, current + strength);
                }
            }
        }
        
        return Array.from(suggestions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, strength]) => ({
                tag,
                confidence: strength / 10,
                source: 'relationship'
            }));
    }
}

class TagAnalytics {
    constructor(tagManager) {
        this.tagManager = tagManager;
    }

    async generateReport(category = null) {
        const stats = {
            overview: await this.generateOverview(category),
            trends: await this.analyzeTrends(category),
            relationships: await this.analyzeRelationships(category),
            recommendations: await this.generateRecommendations(category)
        };

        return stats;
    }

    async generateOverview(category) {
        const stats = {
            totalTags: 0,
            uniqueTags: new Set(),
            topTags: [],
            recentActivity: []
        };

        // Filter by category if specified
        const relevantHistory = category
            ? this.tagManager.tagHistory.filter(usage => usage.category === category)
            : this.tagManager.tagHistory;

        // Calculate statistics
        relevantHistory.forEach(usage => {
            stats.totalTags++;
            stats.uniqueTags.add(usage.tag);
        });

        // Get top tags
        stats.topTags = this.calculateTopTags(relevantHistory);
        
        // Get recent activity
        stats.recentActivity = this.getRecentActivity(relevantHistory);

        return stats;
    }

    async analyzeTrends(category) {
        return {
            hourly: this.analyzeHourlyTrends(category),
            daily: this.analyzeDailyTrends(category),
            weekly: this.analyzeWeeklyTrends(category)
        };
    }

    async analyzeRelationships(category) {
        return {
            strongPairs: this.findStrongTagPairs(category),
            clusters: this.identifyTagClusters(category),
            isolated: this.findIsolatedTags(category)
        };
    }

    async generateRecommendations(category) {
        return {
            merge: this.findMergeCandidates(category),
            split: this.findSplitCandidates(category),
            remove: this.findRemovalCandidates(category)
        };
    }
}

// Integration with QuantumKitchen
QuantumKitchen.prototype.tagManager = new TagManager();