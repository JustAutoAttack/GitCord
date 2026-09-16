import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { GuildUserPermissionsRepo } from '../../../../src/database/repos/guild-user-permissions';
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

describe('GuildUserPermissionsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GuildUserPermissionsRepo;
	let parentCommandId: string;

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE bot_commands (
                id TEXT PRIMARY KEY NOT NULL,
                command_name TEXT NOT NULL,
                description TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE guild_user_permissions (
                id TEXT PRIMARY KEY NOT NULL,
                guild_id TEXT NOT NULL,
                discord_user_id TEXT NOT NULL,
                command_id TEXT NOT NULL REFERENCES bot_commands(id) ON DELETE CASCADE,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_guild_user_permissions_unique ON guild_user_permissions (guild_id, discord_user_id, command_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new GuildUserPermissionsRepo(db as any);

		// Seed parent bot command for foreign key validation
		parentCommandId = 'cmd-uuid-1';
		const now = new Date().toISOString();
		sqlite
			.prepare(
				`
            INSERT INTO bot_commands (id, command_name, description, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?)
        `
			)
			.run(parentCommandId, 'test-command', 'A test command', now, now);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find guild user permission records using custom finders', () => {
		const created = repo.create({
			guildId: 'guild-123',
			discordUserId: 'user-456',
			commandId: parentCommandId
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.guildId).toBe('guild-123');
		expect(created.discordUserId).toBe('user-456');
		expect(created.commandId).toBe(parentCommandId);

		// Test findById and all custom finders
		expect(repo.findById(created.id)).toEqual(created);
		expect(repo.findByGuildId('guild-123')).toEqual([created]);
		expect(repo.findByGuildAndUser('guild-123', 'user-456')).toEqual([
			created
		]);
		expect(
			repo.findByGuildUserAndCommand(
				'guild-123',
				'user-456',
				parentCommandId
			)
		).toEqual(created);
	});

	it('should return empty arrays or undefined when custom finders miss', () => {
		expect(repo.findByGuildId('fake-guild')).toEqual([]);
		expect(repo.findByGuildAndUser('guild-123', 'fake-user')).toEqual([]);
		expect(
			repo.findByGuildUserAndCommand('guild-123', 'user-456', 'fake-cmd')
		).toBeUndefined();
	});

	it('should retrieve all permission records via findAll', () => {
		repo.create({
			guildId: 'guild-1',
			discordUserId: 'user-1',
			commandId: parentCommandId
		});
		repo.create({
			guildId: 'guild-2',
			discordUserId: 'user-2',
			commandId: parentCommandId
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('should update an existing permission record successfully', async () => {
		const created = repo.create({
			guildId: 'guild-upd',
			discordUserId: 'user-upd',
			commandId: parentCommandId
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			discordUserId: 'user-updated-new'
		});

		expect(updated).toBeDefined();
		expect(updated?.discordUserId).toBe('user-updated-new');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		expect(
			repo.update('fake-id', { discordUserId: 'test' })
		).toBeUndefined();
	});

	it('should delete an existing permission record and return the deleted entity', () => {
		const created = repo.create({
			guildId: 'guild-del',
			discordUserId: 'user-del',
			commandId: parentCommandId
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);
		expect(repo.findById(created.id)).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		expect(repo.delete('fake-id')).toBeUndefined();
	});

	it('should enforce unique index constraints on (guild_id, discord_user_id, command_id)', () => {
		repo.create({
			guildId: 'guild-shared',
			discordUserId: 'user-shared',
			commandId: parentCommandId
		});

		expect(() => {
			repo.create({
				guildId: 'guild-shared',
				discordUserId: 'user-shared',
				commandId: parentCommandId
			});
		}).toThrow();
	});
});
