import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import Database from 'better-sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import {
	checkDatabaseHealth,
	checkDbHealth,
	createDatabase
} from '@database/client';

// Database Client Checks
describe('createDatabase', () => {
	const databases: Array<ReturnType<typeof createDatabase>> = [];
	const cleanupPaths: string[] = [];

	afterEach(() => {
		for (const database of databases) {
			if (database.sqlite.open) {
				database.sqlite.close();
			}
		}

		databases.length = 0;

		for (const cleanupPath of cleanupPaths) {
			fs.rmSync(cleanupPath, {
				recursive: true,
				force: true
			});
		}

		cleanupPaths.length = 0;
	});

	// --- In-Memory Database ---
	it('creates a working in-memory SQLite database', () => {
		const database = createDatabase(':memory:');
		databases.push(database);

		const result = database.sqlite.prepare('SELECT 1 AS alive').get() as {
			alive: number;
		};

		expect(result).toEqual({ alive: 1 });
	});

	// --- Drizzle Client Binding ---
	it('creates a Drizzle client', () => {
		const database = createDatabase(':memory:');
		databases.push(database);

		expect(database.db).toBeDefined();
	});

	// --- Foreign Key Enforcement ---
	it('enables foreign key enforcement', () => {
		const database = createDatabase(':memory:');
		databases.push(database);

		const result = database.sqlite.prepare('PRAGMA foreign_keys').get() as {
			foreign_keys: number;
		};

		expect(result).toEqual({
			foreign_keys: 1
		});
	});

	// --- WAL Journal Mode ---
	it('uses WAL journal mode for file-backed databases', () => {
		const directory = path.join(
			os.tmpdir(),
			`gitcord-test-${crypto.randomUUID()}`
		);

		const databasePath = path.join(directory, 'test.db');

		const database = createDatabase(databasePath);
		databases.push(database);
		cleanupPaths.push(directory);

		const result = database.sqlite.prepare('PRAGMA journal_mode').get() as {
			journal_mode: string;
		};

		expect(result.journal_mode.toLowerCase()).toBe('wal');
	});

	// --- Directory Auto-Creation ---
	it('creates the parent directory for a file-backed database', () => {
		const directory = path.join(
			os.tmpdir(),
			`gitcord-test-${crypto.randomUUID()}`
		);

		const databasePath = path.join(directory, 'test.db');

		const database = createDatabase(databasePath);
		databases.push(database);
		cleanupPaths.push(directory);

		expect(fs.existsSync(directory)).toBe(true);
		expect(fs.existsSync(databasePath)).toBe(true);
	});

	// --- File Protocol Support ---
	it('supports the file: database URL format', () => {
		const directory = path.join(
			os.tmpdir(),
			`gitcord-test-${crypto.randomUUID()}`
		);

		const databasePath = path.join(directory, 'test.db');

		const database = createDatabase(`file:${databasePath}`);
		databases.push(database);
		cleanupPaths.push(directory);

		expect(fs.existsSync(databasePath)).toBe(true);
	});

	// --- File Memory Support ---
	it('supports file::memory: databases', () => {
		const database = createDatabase('file::memory:');
		databases.push(database);

		const result = database.sqlite.prepare('SELECT 1 AS alive').get() as {
			alive: number;
		};

		expect(result).toEqual({ alive: 1 });
	});
});

// Database Health Checks
describe('checkDatabaseHealth', () => {
	// --- Health Up Status ---
	it('reports the database as up', () => {
		const database = createDatabase(':memory:');

		try {
			const result = checkDatabaseHealth(database.sqlite);

			expect(result.status).toBe('up');
			expect(result.latencyMs).toEqual(expect.any(Number));
			expect(result.latencyMs).toBeGreaterThanOrEqual(0);
		} finally {
			database.sqlite.close();
		}
	});

	// --- Global Singleton Health Check ---
	it('checks the global singleton database health', () => {
		const result = checkDbHealth();

		expect(result.status).toBe('up');
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	// --- Health Down Status ---
	it('reports the database as down when the connection is closed', () => {
		const database = createDatabase(':memory:');

		database.sqlite.close();

		const result = checkDatabaseHealth(database.sqlite);

		expect(result.status).toBe('down');
		expect(result.error).toEqual(expect.any(String));
	});

	// --- Health Unexpected Output ---
	it('reports the database as down when query output is unexpected', () => {
		const mockDb = {
			prepare: () => ({
				get: () => ({ alive: 0 })
			})
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.status).toBe('down');
		expect(result.error).toBe('Unexpected query output');
	});

	// --- Health Connection Exception ---
	it('reports the database as down when an exception occurs during the check', () => {
		const mockDb = {
			prepare: () => {
				throw new Error('connection lost');
			}
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.status).toBe('down');
		expect(result.error).toBe('connection lost');
	});

	// --- Health Non-Error Throw ---
	it('reports the database as down with a default message when a non-Error is thrown', () => {
		const mockDb = {
			prepare: () => {
				throw 'string-based failure';
			}
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.status).toBe('down');
		expect(result.error).toBe('Database check failed');
	});
});
