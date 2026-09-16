import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { BotCommandsRepo } from '../../../../src/database/repos/bot-commands';
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

describe('BotCommandsRepo (and BaseRepo)', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: BotCommandsRepo;

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
            CREATE UNIQUE INDEX idx_bot_commands_name ON bot_commands (command_name);
        `);

		db = drizzle(sqlite, { schema });
		repo = new BotCommandsRepo(db as any);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find a bot command by id and command name', () => {
		const created = repo.create({
			commandName: 'ping',
			description: 'Replies with pong'
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.commandName).toBe('ping');
		expect(created.description).toBe('Replies with pong');

		const foundById = repo.findById(created.id);
		expect(foundById).toEqual(created);

		const foundByName = repo.findByCommandName('ping');
		expect(foundByName).toEqual(created);
	});

	it('should return undefined when finding a non-existent command name or id', () => {
		expect(repo.findById('non-existent-id')).toBeUndefined();
		expect(repo.findByCommandName('non-existent-name')).toBeUndefined();
	});

	it('should retrieve all bot commands via findAll', () => {
		repo.create({ commandName: 'cmd1', description: 'desc1' });
		repo.create({ commandName: 'cmd2', description: 'desc2' });

		const all = repo.findAll();
		expect(all).toHaveLength(2);
		expect(all.map((c) => c.commandName)).toContain('cmd1');
		expect(all.map((c) => c.commandName)).toContain('cmd2');
	});

	it('should update an existing bot command successfully', async () => {
		const created = repo.create({
			commandName: 'status',
			description: 'Old description'
		});

		// Ensure a distinct timestamp for updatedAt
		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			description: 'New description'
		});

		expect(updated).toBeDefined();
		expect(updated?.description).toBe('New description');
		expect(updated?.commandName).toBe('status');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		const result = repo.update('fake-id', { description: 'test' });
		expect(result).toBeUndefined();
	});

	it('should delete an existing bot command and return the deleted entity', () => {
		const created = repo.create({
			commandName: 'temp',
			description: 'To be deleted'
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);

		const found = repo.findById(created.id);
		expect(found).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		const result = repo.delete('fake-id');
		expect(result).toBeUndefined();
	});

	it('should throw an error and log when database operation fails on create', () => {
		repo.create({ commandName: 'sync', description: 'first' });

		const duplicateInsert = () => {
			repo.create({ commandName: 'sync', description: 'second' });
		};

		expect(duplicateInsert).toThrow();
	});

	it('should throw and log error when update fails due to constraint violation', () => {
		repo.create({ commandName: 'cmd_a', description: 'First' });
		const cmdB = repo.create({
			commandName: 'cmd_b',
			description: 'Second'
		});

		// Attempting to update cmd_b to an already existing commandName causes a unique constraint error
		expect(() => {
			repo.update(cmdB.id, { commandName: 'cmd_a' });
		}).toThrow();
	});

	it('should throw and log error when delete operation encounters a database error', () => {
		const created = repo.create({
			commandName: 'fail_delete',
			description: 'Test'
		});

		// Force an error during delete execution
		vi.spyOn(repo['db'], 'delete').mockImplementationOnce(() => {
			throw new Error('Simulated DB delete failure');
		});

		expect(() => repo.delete(created.id)).toThrow(
			'Simulated DB delete failure'
		);
	});
});
