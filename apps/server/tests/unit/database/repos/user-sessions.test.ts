import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { UserSessionsRepo } from '@database/repos/user-sessions';
import * as schema from '@database/generated/schema';

describe('UserSessionsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: UserSessionsRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE user_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                access_token_encrypted TEXT NOT NULL,
                refresh_token_encrypted TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new UserSessionsRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	it('creates and finds a user session by user id', () => {
		const input = {
			userId: 'usr-1',
			accessTokenEncrypted: 'enc_acc',
			refreshTokenEncrypted: 'enc_ref',
			expiresAt: new Date().toISOString()
		};
		const created = repo.create(input);

		expect(created).toMatchObject(input);

		const found = repo.findByUserId('usr-1');
		expect(found).toEqual(created);

		const missing = repo.findByUserId('non-existent');
		expect(missing).toBeUndefined();
	});

	it('supports base repository findAll and findById methods', () => {
		const created = repo.create({
			userId: 'usr-2',
			accessTokenEncrypted: 'enc_acc_2',
			refreshTokenEncrypted: 'enc_ref_2',
			expiresAt: new Date().toISOString()
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
			userId: 'usr-3',
			accessTokenEncrypted: 'enc_acc_3',
			refreshTokenEncrypted: 'enc_ref_3',
			expiresAt: new Date().toISOString()
		});

		const updated = repo.update(created.id, {
			accessTokenEncrypted: 'new_acc'
		});
		expect(updated?.accessTokenEncrypted).toBe('new_acc');

		const nonExistentUpdate = repo.update('non-existent-id', {
			accessTokenEncrypted: 'fail'
		});
		expect(nonExistentUpdate).toBeUndefined();

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const nonExistentDelete = repo.delete('non-existent-id');
		expect(nonExistentDelete).toBeUndefined();
	});
});
