import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { GuildSettingsRepo } from '../../../../src/database/repos/guild-settings';
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

describe('GuildSettingsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GuildSettingsRepo;

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE guild_settings (
                id TEXT PRIMARY KEY NOT NULL,
                guild_id TEXT NOT NULL,
                system_channel_id TEXT NOT NULL,
                notify_on_connection NUMERIC NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_guild_settings_guild_id ON guild_settings (guild_id);
            CREATE UNIQUE INDEX idx_guild_settings_system_channel_id ON guild_settings (system_channel_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new GuildSettingsRepo(db as any);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and map guild settings correctly with default and custom boolean values', () => {
		// Create with explicit notifyOnConnection = true
		const createdTrue = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-chan-1',
			notifyOnConnection: true
		});

		expect(createdTrue).toBeDefined();
		expect(createdTrue.guildId).toBe('guild-1');
		expect(createdTrue.systemChannelId).toBe('sys-chan-1');
		expect(createdTrue.notifyOnConnection).toBe(true);

		// Create with default notifyOnConnection (omitted -> defaults to true/'1')
		const createdDefault = repo.create({
			guildId: 'guild-2',
			systemChannelId: 'sys-chan-2'
		});
		expect(createdDefault.notifyOnConnection).toBe(true);

		// Create with notifyOnConnection = false
		const createdFalse = repo.create({
			guildId: 'guild-3',
			systemChannelId: 'sys-chan-3',
			notifyOnConnection: false
		});
		expect(createdFalse.notifyOnConnection).toBe(false);

		// Test findById and findByGuildId and findBySystemChannelId
		expect(repo.findById(createdTrue.id)).toEqual(createdTrue);
		expect(repo.findByGuildId('guild-2')).toEqual(createdDefault);
		expect(repo.findBySystemChannelId('sys-chan-3')).toEqual(createdFalse);
	});

	it('should return undefined when custom finders miss', () => {
		expect(repo.findByGuildId('missing-guild')).toBeUndefined();
		expect(repo.findBySystemChannelId('missing-chan')).toBeUndefined();
		expect(repo.findById('missing-id')).toBeUndefined();
	});

	it('should find records by notifyOnConnection status', () => {
		repo.create({
			guildId: 'g-1',
			systemChannelId: 'c-1',
			notifyOnConnection: true
		});
		repo.create({
			guildId: 'g-2',
			systemChannelId: 'c-2',
			notifyOnConnection: false
		});
		repo.create({
			guildId: 'g-3',
			systemChannelId: 'c-3',
			notifyOnConnection: true
		});

		const trueSettings = repo.findByNotifyOnConnection(true);
		expect(trueSettings).toHaveLength(2);

		const falseSettings = repo.findByNotifyOnConnection(false);
		expect(falseSettings).toHaveLength(1);
		const [setting] = falseSettings;
		expect(setting?.guildId).toBe('g-2');
	});

	it('should retrieve all guild settings via findAll with proper mapping', () => {
		repo.create({ guildId: 'g-1', systemChannelId: 'c-1' });
		repo.create({ guildId: 'g-2', systemChannelId: 'c-2' });

		const all = repo.findAll();
		expect(all).toHaveLength(2);
		expect(all[0]?.notifyOnConnection).toBe(true);
	});

	it('should update guild settings and map boolean changes correctly', async () => {
		const created = repo.create({
			guildId: 'guild-upd',
			systemChannelId: 'sys-upd',
			notifyOnConnection: true
		});

		// Ensure a distinct timestamp shift for updatedAt
		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			notifyOnConnection: false,
			systemChannelId: 'sys-new'
		});

		expect(updated).toBeDefined();
		expect(updated?.notifyOnConnection).toBe(false);
		expect(updated?.systemChannelId).toBe('sys-new');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		expect(
			repo.update('fake-id', { notifyOnConnection: false })
		).toBeUndefined();
	});

	it('should enforce unique index constraints on guild_id and system_channel_id', () => {
		repo.create({ guildId: 'shared-guild', systemChannelId: 'chan-1' });

		// Duplicate guildId
		expect(() => {
			repo.create({ guildId: 'shared-guild', systemChannelId: 'chan-2' });
		}).toThrow();

		// Duplicate systemChannelId
		expect(() => {
			repo.create({ guildId: 'other-guild', systemChannelId: 'chan-1' });
		}).toThrow();
	});
});
