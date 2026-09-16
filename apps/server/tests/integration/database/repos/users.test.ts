import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { UsersRepo } from '../../../../src/database/repos/users';
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

describe('UsersRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: UsersRepo;

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY NOT NULL,
                discord_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_users_discord_id ON users (discord_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new UsersRepo(db as any);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find a user by id and discordId', () => {
		const created = repo.create({
			discordId: 'discord-12345',
			displayName: 'Octocat',
			avatarUrl: 'https://example.com/avatar.png'
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.discordId).toBe('discord-12345');
		expect(created.displayName).toBe('Octocat');
		expect(created.avatarUrl).toBe('https://example.com/avatar.png');

		expect(repo.findById(created.id)).toEqual(created);
		expect(repo.findByDiscordId('discord-12345')).toEqual(created);
	});

	it('should return undefined when finding a non-existent user', () => {
		expect(repo.findById('non-existent-id')).toBeUndefined();
		expect(repo.findByDiscordId('non-existent-discord-id')).toBeUndefined();
	});

	it('should retrieve all users via findAll', () => {
		repo.create({ discordId: 'disc-1', displayName: 'User One' });
		repo.create({
			discordId: 'disc-2',
			displayName: 'User Two',
			avatarUrl: null
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('should update an existing user successfully', async () => {
		const created = repo.create({
			discordId: 'disc-upd',
			displayName: 'Old Name'
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			displayName: 'New Name'
		});

		expect(updated).toBeDefined();
		expect(updated?.displayName).toBe('New Name');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		expect(repo.update('fake-id', { displayName: 'test' })).toBeUndefined();
	});

	it('should delete an existing user and return the deleted entity', () => {
		const created = repo.create({
			discordId: 'disc-del',
			displayName: 'To Delete'
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);
		expect(repo.findById(created.id)).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		expect(repo.delete('fake-id')).toBeUndefined();
	});

	it('should enforce unique index constraints on discordId', () => {
		repo.create({
			discordId: 'shared-discord-id',
			displayName: 'User One'
		});

		expect(() => {
			repo.create({
				discordId: 'shared-discord-id',
				displayName: 'User Two'
			});
		}).toThrow();
	});
});
