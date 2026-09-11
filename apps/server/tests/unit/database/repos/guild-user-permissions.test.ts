import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { GuildUserPermissionsRepo } from '@database/repos/guild-user-permissions';
import * as schema from '@database/generated/schema';

describe('GuildUserPermissionsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GuildUserPermissionsRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE guild_user_permissions (
                id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                discord_user_id TEXT NOT NULL,
                command_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new GuildUserPermissionsRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	it('creates and queries user permissions by guild and user', () => {
		const input = { guildId: 'g1', discordUserId: 'u1', commandId: 'c1' };
		const created = repo.create(input);

		expect(created).toMatchObject(input);

		const byGuildAndUser = repo.findByGuildAndUser('g1', 'u1');
		expect(byGuildAndUser).toHaveLength(1);
		expect(byGuildAndUser[0]?.id).toBe(created.id);

		const byGuildUserCommand = repo.findByGuildUserAndCommand(
			'g1',
			'u1',
			'c1'
		);
		expect(byGuildUserCommand?.id).toBe(created.id);

		const missingGuildUserCommand = repo.findByGuildUserAndCommand(
			'g1',
			'u1',
			'non-existent'
		);
		expect(missingGuildUserCommand).toBeUndefined();
	});

	it('queries permissions by guild id', () => {
		repo.create({ guildId: 'g1', discordUserId: 'u1', commandId: 'c1' });
		repo.create({ guildId: 'g1', discordUserId: 'u2', commandId: 'c2' });
		repo.create({ guildId: 'g2', discordUserId: 'u1', commandId: 'c1' });

		const results = repo.findByGuildId('g1');
		expect(results).toHaveLength(2);
	});

	it('finds all and finds by id using base repository methods', () => {
		const created = repo.create({
			guildId: 'g1',
			discordUserId: 'u1',
			commandId: 'c1'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(1);

		const found = repo.findById(created.id);
		expect(found?.id).toBe(created.id);

		const missing = repo.findById('non-existent');
		expect(missing).toBeUndefined();
	});

	it('updates and deletes records successfully', () => {
		const created = repo.create({
			guildId: 'g1',
			discordUserId: 'u1',
			commandId: 'c1'
		});

		const updated = repo.update(created.id, { commandId: 'c2' });
		expect(updated?.commandId).toBe('c2');

		const nonExistentUpdate = repo.update('non-existent', {
			commandId: 'c3'
		});
		expect(nonExistentUpdate).toBeUndefined();

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const nonExistentDelete = repo.delete('non-existent');
		expect(nonExistentDelete).toBeUndefined();
	});
});
