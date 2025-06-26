// src/core/DriveConnector.js
import { google } from 'googleapis';
import EventEmitter from '../utils/EventEmitter.js';

export class DriveConnector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            spaces: {
                creation: 'Creation_Space',
                integration: 'Integration_Space',
                application: 'Application_Space',
                foundation: 'Foundation_Space'
            },
            cacheTimeout: 5 * 60 * 1000, // 5 minutes
            ...config
        };

        this.drive = null;
        this.spaceIds = new Map();
        this.fileCache = new Map();
        this.connected = false;
        this.auth = null;
    }

    async connectToDrive() {
        try {
            this.auth = await this.authenticate();
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            await this.initializeSpaces();
            this.connected = true;
            this.emit('connected');
            return true;
        } catch (error) {
            this.emit('error', error);
            throw new Error(`Drive connection failed: ${error.message}`);
        }
    }

    async authenticate() {
        // Implementation would depend on your authentication method
        // Could be OAuth2, Service Account, or other methods
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/drive']
        });
        return auth.getClient();
    }

    async initializeSpaces() {
        for (const [space, name] of Object.entries(this.config.spaces)) {
            const folderId = await this.findOrCreateSpace(name);
            this.spaceIds.set(space, folderId);
        }
    }

    async findOrCreateSpace(name) {
        try {
            // Check if space exists
            const existing = await this.drive.files.list({
                q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)'
            });

            if (existing.data.files.length > 0) {
                return existing.data.files[0].id;
            }

            // Create new space if it doesn't exist
            const newSpace = await this.drive.files.create({
                requestBody: {
                    name,
                    mimeType: 'application/vnd.google-apps.folder'
                },
                fields: 'id'
            });

            return newSpace.data.id;
        } catch (error) {
            throw new Error(`Space initialization failed: ${error.message}`);
        }
    }

    async moveFileToSpace(fileId, space) {
        if (!this.spaceIds.has(space)) {
            throw new Error(`Invalid space: ${space}`);
        }

        const targetSpaceId = this.spaceIds.get(space);
        
        try {
            // Get current parent folders
            const file = await this.drive.files.get({
                fileId,
                fields: 'parents'
            });

            // Remove from current parents and add to new space
            await this.drive.files.update({
                fileId,
                removeParents: file.data.parents.join(','),
                addParents: targetSpaceId,
                fields: 'id, parents'
            });

            // Clear cache for this file
            this.fileCache.delete(fileId);
            
            this.emit('fileMoved', { fileId, space });
            return true;
        } catch (error) {
            throw new Error(`File move failed: ${error.message}`);
        }
    }

    async getFileContent(fileId, { useCache = true } = {}) {
        // Check cache first if enabled
        if (useCache && this.fileCache.has(fileId)) {
            const cached = this.fileCache.get(fileId);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                return cached.content;
            }
        }

        try {
            const response = await this.drive.files.get({
                fileId,
                alt: 'media'
            });

            const content = response.data;
            
            // Update cache
            this.fileCache.set(fileId, {
                content,
                timestamp: Date.now()
            });

            return content;
        } catch (error) {
            throw new Error(`Failed to get file content: ${error.message}`);
        }
    }

    async updateFileMetadata(fileId, metadata) {
        try {
            await this.drive.files.update({
                fileId,
                requestBody: {
                    appProperties: metadata
                }
            });

            // Clear cache for this file
            this.fileCache.delete(fileId);
            
            this.emit('metadataUpdated', { fileId, metadata });
            return true;
        } catch (error) {
            throw new Error(`Metadata update failed: ${error.message}`);
        }
    }

    async getFilesInSpace(space, { recursive = false } = {}) {
        if (!this.spaceIds.has(space)) {
            throw new Error(`Invalid space: ${space}`);
        }

        const spaceId = this.spaceIds.get(space);
        let query = `'${spaceId}' in parents and trashed=false`;

        try {
            const files = await this.drive.files.list({
                q: query,
                fields: 'files(id, name, mimeType, modifiedTime, appProperties)',
                orderBy: 'modifiedTime desc'
            });

            if (recursive) {
                // Get files from subfolders
                const subfolders = files.data.files.filter(
                    file => file.mimeType === 'application/vnd.google-apps.folder'
                );
                
                for (const folder of subfolders) {
                    const subFiles = await this.getFilesInSpace(folder.id, { recursive: true });
                    files.data.files.push(...subFiles);
                }
            }

            return files.data.files;
        } catch (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }

    async createFile(name, content, space, metadata = {}) {
        if (!this.spaceIds.has(space)) {
            throw new Error(`Invalid space: ${space}`);
        }

        const spaceId = this.spaceIds.get(space);

        try {
            const response = await this.drive.files.create({
                requestBody: {
                    name,
                    parents: [spaceId],
                    appProperties: metadata
                },
                media: {
                    body: content
                },
                fields: 'id'
            });

            this.emit('fileCreated', { 
                fileId: response.data.id, 
                space, 
                metadata 
            });
            
            return response.data.id;
        } catch (error) {
            throw new Error(`File creation failed: ${error.message}`);
        }
    }

    async searchFiles(query, { spaces = null } = {}) {
        let baseQuery = `trashed=false`;
        
        if (spaces) {
            const spaceIds = spaces.map(space => this.spaceIds.get(space));
            baseQuery += ` and (${spaceIds.map(id => `'${id}' in parents`).join(' or ')})`;
        }

        if (query) {
            baseQuery += ` and (${query})`;
        }

        try {
            const response = await this.drive.files.list({
                q: baseQuery,
                fields: 'files(id, name, mimeType, modifiedTime, appProperties)',
                orderBy: 'modifiedTime desc'
            });

            return response.data.files;
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async saveSystemState(state) {
        const stateFileName = `system_state_${new Date().toISOString()}.json`;
        
        try {
            await this.createFile(
                stateFileName,
                JSON.stringify(state, null, 2),
                'foundation',
                { type: 'system_state' }
            );
            
            return true;
        } catch (error) {
            throw new Error(`Failed to save system state: ${error.message}`);
        }
    }

    async disconnect() {
        this.connected = false;
        this.fileCache.clear();
        this.emit('disconnected');
    }

    isConnected() {
        return this.connected;
    }
}

export default DriveConnector;