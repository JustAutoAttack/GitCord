import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { RepoConfigsRepo } from '@database';
import * as schema from '@database/generated/schema';

describe('RepoConfigsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: RepoConfigsRepo;

	beforeEach(() => {
		// Create an isolated in-memory database for each test
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		// Create the table structure required by repoConfigs
		sqlite.exec(`
            CREATE TABLE repo_configs (
                id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                command_channel_id TEXT NOT NULL,
                notification_channel_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new RepoConfigsRepo(db);
	});

	afterEach(() => {
		if (sqlite.open) {
			sqlite.close();
		}
	});

	// --- Create & Find By ID ---
	it('creates and finds a config by id', async () => {
		const input = {
			id: 'config-1',
			guildId: 'guild-123',
			commandChannelId: 'cmd-chan-1',
			notificationChannelId: 'notif-chan-1'
		};

		const created = await repo.create(input);

		expect(created).toMatchObject({
			id: 'config-1',
			guildId: 'guild-123',
			commandChannelId: 'cmd-chan-1',
			notificationChannelId: 'notif-chan-1'
		});
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		const found = await repo.findById('config-1');
		expect(found).toEqual(created);
	});

	// --- Find All Records ---
	it('finds all configuration records', async () => {
		await repo.create({
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		await repo.create({
			id: 'config-2',
			guildId: 'guild-2',
			commandChannelId: 'cmd-2',
			notificationChannelId: 'notif-2'
		});

		const all = await repo.findAll();
		expect(all).toHaveLength(2);
		expect(all.map((c) => c.id)).toEqual(['config-1', 'config-2']);
	});

	// --- Find By Custom Field ---
	it('finds a record by command channel ID', async () => {
		await repo.create({
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'target-cmd-chan',
			notificationChannelId: 'notif-1'
		});

		const found = await repo.findByCommandChannelId('target-cmd-chan');
		expect(found).toBeDefined();
		expect(found?.id).toBe('config-1');

		const missing = await repo.findByCommandChannelId('non-existent');
		expect(missing).toBeUndefined();
	});

	// --- Update Record ---
	it('updates an existing configuration record', async () => {
		await repo.create({
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		// Small pause to guarantee a distinct timestamp in fast environments
		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = await repo.update('config-1', {
			notificationChannelId: 'updated-notif-chan'
		});

		expect(updated?.notificationChannelId).toBe('updated-notif-chan');
		expect(updated?.updatedAt).not.toEqual(updated?.createdAt);
	});

	// --- Update Non-Existent ---
	it('returns undefined when updating a non-existent record', async () => {
		const updated = await repo.update('missing', {
			guildId: 'guild-new'
		});

		expect(updated).toBeUndefined();
	});

	// --- Partial Update Preservation ---
	it('preserves existing fields when performing a partial update', async () => {
		await repo.create({
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		await repo.update('config-1', {
			commandChannelId: 'cmd-updated'
		});

		const found = await repo.findById('config-1');
		expect(found?.guildId).toBe('guild-1');
		expect(found?.commandChannelId).toBe('cmd-updated');
		expect(found?.notificationChannelId).toBe('notif-1');
	});

	// --- Delete Record ---
	it('deletes an existing record and returns it', async () => {
		await repo.create({
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		});

		const deleted = await repo.delete('config-1');
		expect(deleted?.id).toBe('config-1');

		const found = await repo.findById('config-1');
		expect(found).toBeUndefined();
	});

	// --- Delete Non-Existent ---
	it('returns undefined when deleting a non-existent record', async () => {
		const deleted = await repo.delete('missing');
		expect(deleted).toBeUndefined();
	});

	// --- Constraint: Duplicate Primary Key ---
	it('throws an error when creating a record with a duplicate primary key id', async () => {
		const input = {
			id: 'config-1',
			guildId: 'guild-1',
			commandChannelId: 'cmd-1',
			notificationChannelId: 'notif-1'
		};

		await repo.create(input);

		await expect(repo.create(input)).rejects.toThrow();
	});

	// --- Constraint: NOT NULL Violation ---
	it('throws an error when violating a NOT NULL constraint', async () => {
		const invalidInput = {
			id: 'config-2',
			guildId: 'guild-1',
			notificationChannelId: 'notif-1'
		};

		await expect(repo.create(invalidInput as any)).rejects.toThrow();
	});
});
