import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { UserSessionsRepo } from '../../../../src/database/repos/user-sessions';
import * as schema from '../../../../src/database/generated/schema';

// Mock database logger
vi.mock('../../../../src/database/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('UserSessionsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: UserSessionsRepo;

	const mockSessionData = (userId: string) => ({
		userId,
		accessTokenEncrypted: 'mock-access-token',
		refreshTokenEncrypted: 'mock-refresh-token',
		expiresAt: new Date(Date.now() + 3600000).toISOString()
	});

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE user_sessions (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                access_token_encrypted TEXT NOT NULL,
                refresh_token_encrypted TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_user_sessions_user_id ON user_sessions (user_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new UserSessionsRepo(db as any);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find user session using custom finder by userId', () => {
		const created = repo.create(mockSessionData('user-123'));

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.userId).toBe('user-123');
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		// Test findById and custom finder findByUserId
		expect(repo.findById(created.id)).toEqual(created);
		expect(repo.findByUserId('user-123')).toEqual(created);
	});

	it('should return undefined when custom finder or findById misses', () => {
		expect(repo.findByUserId('non-existent-user')).toBeUndefined();
		expect(repo.findById('non-existent-id')).toBeUndefined();
	});

	it('should retrieve all user sessions via findAll', () => {
		repo.create(mockSessionData('user-1'));
		repo.create(mockSessionData('user-2'));

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('should update an existing user session successfully', async () => {
		const created = repo.create(mockSessionData('user-abc'));

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			userId: 'user-abc-updated'
		});

		expect(updated).toBeDefined();
		expect(updated?.userId).toBe('user-abc-updated');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		expect(repo.update('fake-id', { userId: 'test' })).toBeUndefined();
	});

	it('should delete an existing user session and return the deleted entity', () => {
		const created = repo.create(mockSessionData('user-del'));

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);
		expect(repo.findById(created.id)).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		expect(repo.delete('fake-id')).toBeUndefined();
	});

	it('should enforce unique index constraints on userId', () => {
		repo.create(mockSessionData('unique-user-id'));

		expect(() => {
			repo.create(mockSessionData('unique-user-id'));
		}).toThrow();
	});
});
