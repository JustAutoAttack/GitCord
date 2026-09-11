import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { BotCommandsRepo } from '@database/repos/bot-commands';
import * as schema from '@database/generated/schema';

describe('BotCommandsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: BotCommandsRepo;

	beforeEach(() => {
		sqlite = new Database(':memory:');
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');

		db = drizzle(sqlite, { schema });

		sqlite.exec(`
            CREATE TABLE bot_commands (
                id TEXT PRIMARY KEY,
                command_name TEXT NOT NULL UNIQUE,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

		repo = new BotCommandsRepo(db);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (sqlite.open) {
			sqlite.close();
		}
	});

	it('creates and finds a command by id and name', () => {
		const input = { commandName: 'ping', description: 'Replies with pong' };
		const created = repo.create(input);

		expect(created).toMatchObject(input);
		expect(created.id).toBeDefined();

		const found = repo.findById(created.id);
		expect(found).toEqual(created);

		const foundByName = repo.findByCommandName('ping');
		expect(foundByName).toEqual(created);

		const missingByName = repo.findByCommandName('non-existent');
		expect(missingByName).toBeUndefined();

		const missingById = repo.findById('non-existent');
		expect(missingById).toBeUndefined();
	});

	it('finds all bot commands', () => {
		repo.create({ commandName: 'ping', description: '1' });
		repo.create({ commandName: 'pong', description: '2' });

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('updates and deletes bot commands successfully', () => {
		const created = repo.create({ commandName: 'ping', description: '1' });

		const updated = repo.update(created.id, { description: 'Updated' });
		expect(updated?.description).toBe('Updated');

		const nonExistentUpdate = repo.update('non-existent', {
			description: 'Fail'
		});
		expect(nonExistentUpdate).toBeUndefined();

		const deleted = repo.delete(created.id);
		expect(deleted?.id).toBe(created.id);

		const nonExistentDelete = repo.delete('non-existent');
		expect(nonExistentDelete).toBeUndefined();
	});
});
