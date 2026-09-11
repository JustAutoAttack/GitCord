import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { UsersRepo } from '@database/repos/users';
import * as schema from '@database/generated/schema';

describe('UsersRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: UsersRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                discord_id TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new UsersRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	it('creates and finds a user by discord id', () => {
		const input = {
			discordId: 'disc-1',
			displayName: 'Test',
			avatarUrl: null
		};
		const created = repo.create(input);

		expect(created).toMatchObject(input);

		const found = repo.findByDiscordId('disc-1');
		expect(found).toEqual(created);

		const missing = repo.findByDiscordId('non-existent');
		expect(missing).toBeUndefined();
	});

	it('supports base repository findAll and findById methods', () => {
		const created = repo.create({
			discordId: 'disc-2',
			displayName: 'Test 2',
			avatarUrl: 'https://example.com/avatar.png'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(1);

		const found = repo.findById(created.id);
		expect(found?.id).toBe(created.id);

		const missing = repo.findById('non-existent-id');
		expect(missing).toBeUndefined();
	});

	it('supports base repository update and delete methods', () => {
		const created = repo.create({
			discordId: 'disc-3',
			displayName: 'Test 3',
			avatarUrl: null
		});

		const updated = repo.update(created.id, {
			displayName: 'Updated Name'
		});
		expect(updated?.displayName).toBe('Updated Name');

		const nonExistentUpdate = repo.update('non-existent-id', {
			displayName: 'Fail'
		});
		expect(nonExistentUpdate).toBeUndefined();

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const nonExistentDelete = repo.delete('non-existent-id');
		expect(nonExistentDelete).toBeUndefined();
	});
});
