// test/unit/core/DriveConnector.test.js
import { jest } from '@jest/globals';
import { DriveConnector } from '../../../src/core/DriveConnector.js';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis');

describe('DriveConnector', () => {
    let driveConnector;
    let mockDrive;
    let mockAuth;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock Drive API methods
        mockDrive = {
            files: {
                list: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                get: jest.fn()
            }
        };

        // Create mock auth
        mockAuth = {
            getClient: jest.fn().mockResolvedValue('mock-auth-client')
        };

        // Set up Google API mock
        google.auth.GoogleAuth = jest.fn().mockImplementation(() => mockAuth);
        google.drive = jest.fn().mockReturnValue(mockDrive);

        // Initialize DriveConnector
        driveConnector = new DriveConnector({
            spaces: {
                creation: 'Creation_Space',
                integration: 'Integration_Space',
                application: 'Application_Space',
                foundation: 'Foundation_Space'
            }
        });
    });

    describe('Connection Management', () => {
        test('should connect to Drive successfully', async () => {
            await driveConnector.connectToDrive();

            expect(google.auth.GoogleAuth).toHaveBeenCalled();
            expect(mockAuth.getClient).toHaveBeenCalled();
            expect(google.drive).toHaveBeenCalledWith({
                version: 'v3',
                auth: 'mock-auth-client'
            });
            expect(driveConnector.isConnected()).toBe(true);
        });

        test('should handle connection failures', async () => {
            mockAuth.getClient.mockRejectedValue(new Error('Auth failed'));

            await expect(driveConnector.connectToDrive())
                .rejects.toThrow('Drive connection failed: Auth failed');
            
            expect(driveConnector.isConnected()).toBe(false);
        });

        test('should disconnect gracefully', async () => {
            await driveConnector.connectToDrive();
            await driveConnector.disconnect();

            expect(driveConnector.isConnected()).toBe(false);
            expect(driveConnector.fileCache.size).toBe(0);
        });
    });

    describe('Space Management', () => {
        beforeEach(async () => {
            await driveConnector.connectToDrive();
        });

        test('should initialize spaces correctly', async () => {
            // Mock space folder check
            mockDrive.files.list.mockResolvedValue({ data: { files: [] } });
            mockDrive.files.create.mockResolvedValue({ data: { id: 'new-folder-id' } });

            await driveConnector.initializeSpaces();

            // Verify space creation
            expect(mockDrive.files.list).toHaveBeenCalled();
            expect(mockDrive.files.create).toHaveBeenCalled();
            expect(driveConnector.spaceIds.size).toBeGreaterThan(0);
        });

        test('should find existing spaces', async () => {
            const mockSpace = { id: 'existing-space-id', name: 'Creation_Space' };
            mockDrive.files.list.mockResolvedValue({ 
                data: { files: [mockSpace] } 
            });

            const spaceId = await driveConnector.findOrCreateSpace('Creation_Space');

            expect(spaceId).toBe(mockSpace.id);
            expect(mockDrive.files.create).not.toHaveBeenCalled();
        });

        test('should create missing spaces', async () => {
            mockDrive.files.list.mockResolvedValue({ data: { files: [] } });
            mockDrive.files.create.mockResolvedValue({ 
                data: { id: 'new-space-id' } 
            });

            const spaceId = await driveConnector.findOrCreateSpace('New_Space');

            expect(spaceId).toBe('new-space-id');
            expect(mockDrive.files.create).toHaveBeenCalled();
        });
    });

    describe('File Operations', () => {
        beforeEach(async () => {
            await driveConnector.connectToDrive();
            driveConnector.spaceIds.set('creation', 'creation-space-id');
        });

        test('should create file in space', async () => {
            const mockFile = {
                name: 'test.txt',
                content: 'test content',
                metadata: { type: 'document' }
            };

            mockDrive.files.create.mockResolvedValue({ data: { id: 'new-file-id' } });

            const fileId = await driveConnector.createFile(
                mockFile.name,
                mockFile.content,
                'creation',
                mockFile.metadata
            );

            expect(fileId).toBe('new-file-id');
            expect(mockDrive.files.create).toHaveBeenCalledWith({
                requestBody: {
                    name: mockFile.name,
                    parents: ['creation-space-id'],
                    appProperties: mockFile.metadata
                },
                media: {
                    body: mockFile.content
                },
                fields: 'id'
            });
        });

        test('should move file between spaces', async () => {
            mockDrive.files.get.mockResolvedValue({
                data: { parents: ['old-parent-id'] }
            });

            await driveConnector.moveFileToSpace('test-file-id', 'creation');

            expect(mockDrive.files.update).toHaveBeenCalledWith({
                fileId: 'test-file-id',
                removeParents: 'old-parent-id',
                addParents: 'creation-space-id',
                fields: 'id, parents'
            });
        });

        test('should get file content with caching', async () => {
            const mockContent = 'file content';
            mockDrive.files.get.mockResolvedValue({ data: mockContent });

            // First call - should hit API
            const content1 = await driveConnector.getFileContent('test-file-id');
            expect(content1).toBe(mockContent);
            expect(mockDrive.files.get).toHaveBeenCalled();

            // Second call - should hit cache
            mockDrive.files.get.mockClear();
            const content2 = await driveConnector.getFileContent('test-file-id');
            expect(content2).toBe(mockContent);
            expect(mockDrive.files.get).not.toHaveBeenCalled();
        });

        test('should update file metadata', async () => {
            const metadata = { status: 'updated' };

            await driveConnector.updateFileMetadata('test-file-id', metadata);

            expect(mockDrive.files.update).toHaveBeenCalledWith({
                fileId: 'test-file-id',
                requestBody: {
                    appProperties: metadata
                }
            });
        });
    });

    describe('File Search and Listing', () => {
        beforeEach(async () => {
            await driveConnector.connectToDrive();
            driveConnector.spaceIds.set('creation', 'creation-space-id');
        });

        test('should list files in space', async () => {
            const mockFiles = [
                { id: 'file1', name: 'test1.txt' },
                { id: 'file2', name: 'test2.txt' }
            ];

            mockDrive.files.list.mockResolvedValue({ data: { files: mockFiles } });

            const files = await driveConnector.getFilesInSpace('creation');

            expect(files).toEqual(mockFiles);
            expect(mockDrive.files.list).toHaveBeenCalledWith({
                q: "'creation-space-id' in parents and trashed=false",
                fields: 'files(id, name, mimeType, modifiedTime, appProperties)',
                orderBy: 'modifiedTime desc'
            });
        });

        test('should search files across spaces', async () => {
            const mockFiles = [
                { id: 'file1', name: 'test1.txt' },
                { id: 'file2', name: 'test2.txt' }
            ];

            mockDrive.files.list.mockResolvedValue({ data: { files: mockFiles } });

            const searchResult = await driveConnector.searchFiles('test query', {
                spaces: ['creation']
            });

            expect(searchResult).toEqual(mockFiles);
            expect(mockDrive.files.list).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        test('should save system state', async () => {
            const mockState = {
                components: { status: 'healthy' },
                timestamp: new Date().toISOString()
            };

            mockDrive.files.create.mockResolvedValue({ data: { id: 'state-file-id' } });

            const result = await driveConnector.saveSystemState(mockState);

            expect(result).toBe(true);
            expect(mockDrive.files.create).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle API errors', async () => {
            mockDrive.files.list.mockRejectedValue(new Error('API Error'));

            await expect(driveConnector.getFilesInSpace('creation'))
                .rejects.toThrow('Failed to list files: API Error');
        });

        test('should handle invalid space errors', async () => {
            await expect(driveConnector.moveFileToSpace('test-id', 'invalid-space'))
                .rejects.toThrow('Invalid space: invalid-space');
        });
    });

    describe('Health Checks', () => {
        test('should report health status', async () => {
            const health = await driveConnector.checkHealth();

            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('metrics');
        });
    });
});
