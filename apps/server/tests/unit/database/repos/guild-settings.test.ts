import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { GuildSettingsRepo } from '@database/repos/guild-settings';
import * as schema from '@database/generated/schema';

describe('GuildSettingsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GuildSettingsRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE guild_settings (
                id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                system_channel_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new GuildSettingsRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	it('creates and finds a setting by id', () => {
		const input = {
			guildId: 'guild-123',
			systemChannelId: 'sys-chan-1'
		};

		const created = repo.create(input);

		expect(created).toMatchObject({
			guildId: 'guild-123',
			systemChannelId: 'sys-chan-1'
		});
		expect(created.id).toBeDefined();
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		const found = repo.findById(created.id);
		expect(found).toEqual(created);
	});

	it('finds all configuration records', () => {
		const s1 = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		const s2 = repo.create({
			guildId: 'guild-2',
			systemChannelId: 'sys-2'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
		expect(all.map((s) => s.id)).toEqual([s1.id, s2.id]);
	});

	it('finds a record by guild ID', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		const found = repo.findByGuildId('guild-1');
		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);

		const missing = repo.findByGuildId('non-existent');
		expect(missing).toBeUndefined();
	});

	it('finds a record by system channel ID', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'target-sys-chan'
		});

		const found = repo.findBySystemChannelId('target-sys-chan');
		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);

		const missing = repo.findBySystemChannelId('non-existent');
		expect(missing).toBeUndefined();
	});

	it('updates an existing configuration record', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		const updated = repo.update(created.id, {
			systemChannelId: 'updated-sys-chan'
		});

		expect(updated?.systemChannelId).toBe('updated-sys-chan');
	});

	it('returns undefined when updating a non-existent record', () => {
		const updated = repo.update('missing', {
			guildId: 'guild-new'
		});

		expect(updated).toBeUndefined();
	});

	it('preserves existing fields when performing a partial update', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		repo.update(created.id, {
			systemChannelId: 'sys-updated'
		});

		const found = repo.findById(created.id);
		expect(found?.guildId).toBe('guild-1');
		expect(found?.systemChannelId).toBe('sys-updated');
	});

	it('deletes an existing record and returns it', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const found = repo.findById(created.id);
		expect(found).toBeUndefined();
	});

	it('returns undefined when deleting a non-existent record', () => {
		const deleted = repo.delete('missing');
		expect(deleted).toBeUndefined();
	});

	it('throws an error when creating a record with a duplicate primary key id', () => {
		vi.spyOn(crypto, 'randomUUID').mockReturnValue(
			'00000000-0000-0000-0000-000000000000' as any
		);

		const input = {
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		};

		repo.create(input);

		expect(() => repo.create(input)).toThrow();
	});

	it('throws an error when violating a NOT NULL constraint', () => {
		const invalidInput = {
			guildId: 'guild-1'
		};

		expect(() => repo.create(invalidInput as any)).toThrow();
	});

	it('logs and throws an error when update fails catastrophically', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		vi.spyOn(db, 'update').mockImplementationOnce(() => {
			throw new Error('Database disk image is malformed');
		});

		expect(() => repo.update(created.id, { guildId: 'new-guild' })).toThrow(
			'Database disk image is malformed'
		);
	});

	it('logs and throws an error when delete fails catastrophically', () => {
		const created = repo.create({
			guildId: 'guild-1',
			systemChannelId: 'sys-1'
		});

		vi.spyOn(db, 'delete').mockImplementationOnce(() => {
			throw new Error('Database lock failure');
		});

		expect(() => repo.delete(created.id)).toThrow('Database lock failure');
	});
});
