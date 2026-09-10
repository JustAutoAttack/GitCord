import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { RemoteConfigsRepo } from '@database/repos/remote-configs';
import * as schema from '@database/generated/schema';

describe('RemoteConfigsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: RemoteConfigsRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE remote_configs (
                id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                repository_url TEXT NOT NULL,
                command_channel_id TEXT NOT NULL,
                notification_channel_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new RemoteConfigsRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	// --- Create & Find By ID ---
	it('creates and finds a config by id', () => {
		const input = {
			guildId: 'guild-123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-chan-1',
			notificationChannelId: 'notif-chan-1'
		};

		const created = repo.create(input);

		expect(created).toMatchObject({
			guildId: 'guild-123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-chan-1',
			notificationChannelId: 'notif-chan-1'
		});
		expect(created.id).toBeDefined();
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		const found = repo.findById(created.id);
		expect(found).toEqual(created);
	});

	// --- Find All Records ---
	it('finds all configuration records', () => {
		const c1 = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		const c2 = repo.create({
			guildId: 'guild-2',
			repositoryUrl: 'https://github.com/owner/repo-2',
			commandChannelId: 'cmd-2',
			notificationChannelId: 'notif-2'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
		expect(all.map((c) => c.id)).toEqual([c1.id, c2.id]);
	});

	// --- Find By Custom Field ---
	it('finds a record by command channel ID', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'target-cmd-chan',
			notificationChannelId: 'notif-1'
		});

		const found = repo.findByCommandChannelId('target-cmd-chan');
		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);

		const missing = repo.findByCommandChannelId('non-existent');
		expect(missing).toBeUndefined();
	});

	// --- Find By Guild and Repo ---
	it('finds a record by guild ID and repository URL', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo-target',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		const found = repo.findByGuildAndRepo(
			'guild-1',
			'https://github.com/owner/repo-target'
		);
		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);

		const missing = repo.findByGuildAndRepo(
			'guild-1',
			'https://github.com/owner/non-existent'
		);
		expect(missing).toBeUndefined();
	});

	// --- Find By Guild ID ---
	it('finds all records matching a guild ID', () => {
		repo.create({
			guildId: 'guild-shared',
			repositoryUrl: 'https://github.com/owner/repo-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		repo.create({
			guildId: 'guild-shared',
			repositoryUrl: 'https://github.com/owner/repo-2',
			commandChannelId: 'cmd-2',
			notificationChannelId: 'notif-2'
		});

		const results = repo.findByGuildId('guild-shared');
		expect(results).toHaveLength(2);

		const empty = repo.findByGuildId('guild-none');
		expect(empty).toHaveLength(0);
	});

	// --- Update Record ---
	it('updates an existing configuration record', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		const updated = repo.update(created.id, {
			notificationChannelId: 'updated-notif-chan'
		});

		expect(updated?.notificationChannelId).toBe('updated-notif-chan');
	});

	// --- Update Non-Existent ---
	it('returns undefined when updating a non-existent record', () => {
		const updated = repo.update('missing', {
			guildId: 'guild-new'
		});

		expect(updated).toBeUndefined();
	});

	// --- Partial Update Preservation ---
	it('preserves existing fields when performing a partial update', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		repo.update(created.id, {
			commandChannelId: 'cmd-updated'
		});

		const found = repo.findById(created.id);
		expect(found?.guildId).toBe('guild-1');
		expect(found?.repositoryUrl).toBe('https://github.com/owner/repo');
		expect(found?.commandChannelId).toBe('cmd-updated');
		expect(found?.notificationChannelId).toBe('notif-1');
	});

	// --- Delete Record ---
	it('deletes an existing record and returns it', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const found = repo.findById(created.id);
		expect(found).toBeUndefined();
	});

	// --- Delete Non-Existent ---
	it('returns undefined when deleting a non-existent record', () => {
		const deleted = repo.delete('missing');
		expect(deleted).toBeUndefined();
	});

	// --- Constraint: Duplicate Primary Key ---
	it('throws an error when creating a record with a duplicate primary key id', () => {
		vi.spyOn(crypto, 'randomUUID').mockReturnValue(
			'00000000-0000-0000-0000-000000000000' as any
		);

		const input = {
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		};

		repo.create(input);

		expect(() => repo.create(input)).toThrow();
	});

	// --- Constraint: NOT NULL Violation ---
	it('throws an error when violating a NOT NULL constraint', () => {
		const invalidInput = {
			guildId: 'guild-1',
			notificationChannelId: 'notif-1'
		};

		expect(() => repo.create(invalidInput as any)).toThrow();
	});

	// --- Error Handling: Update Catch Block ---
	it('logs and throws an error when update fails catastrophically', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		vi.spyOn(db, 'update').mockImplementationOnce(() => {
			throw new Error('Database disk image is malformed');
		});

		expect(() => repo.update(created.id, { guildId: 'new-guild' })).toThrow(
			'Database disk image is malformed'
		);
	});

	// --- Error Handling: Delete Catch Block ---
	it('logs and throws an error when delete fails catastrophically', () => {
		const created = repo.create({
			guildId: 'guild-1',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		vi.spyOn(db, 'delete').mockImplementationOnce(() => {
			throw new Error('Database lock failure');
		});

		expect(() => repo.delete(created.id)).toThrow('Database lock failure');
	});
});
