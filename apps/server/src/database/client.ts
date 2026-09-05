import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { ENV } from '@core/env';
import * as schema from './generated/schema';

export interface DatabaseClient {
	sqlite: Database.Database;
	db: ReturnType<typeof drizzle>;
}

export interface DbHealthResult {
	status: 'up' | 'down';
	latencyMs?: number;
	error?: string;
}

/**
 * Creates a SQLite database connection and its Drizzle client.
 *
 * Production uses a file-backed SQLite database.
 * Tests can use ':memory:' for an isolated database.
 */
export function createDatabase(databaseUrl: string): DatabaseClient {
	const isMemoryDatabase =
		databaseUrl === ':memory:' || databaseUrl === 'file::memory:';

	const sqlite = isMemoryDatabase
		? new Database(':memory:')
		: createFileDatabase(databaseUrl);

	// SQLite performance and integrity settings.
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	sqlite.pragma('synchronous = NORMAL');

	const db = drizzle(sqlite, {
		schema
	});

	return {
		sqlite,
		db
	};
}

/**
 * Creates a file-backed SQLite database.
 */
function createFileDatabase(databaseUrl: string): Database.Database {
	const rawPath = databaseUrl.replace(/^file:/, '');
	const dbPath = path.resolve(process.cwd(), rawPath);
	const dbDir = path.dirname(dbPath);

	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	return new Database(dbPath);
}

const database = createDatabase(ENV.DATABASE_URL);

export const sqlite = database.sqlite;
export const db = database.db;

/**
 * Fast synchronous health probe for SQLite database
 * connectivity and latency.
 */
export function checkDatabaseHealth(
	database: Database.Database
): DbHealthResult {
	const start = performance.now();

	try {
		const row = database.prepare('SELECT 1 AS alive').get() as
			| { alive: number }
			| undefined;

		if (row?.alive === 1) {
			return {
				status: 'up',
				latencyMs: Number((performance.now() - start).toFixed(2))
			};
		}

		return {
			status: 'down',
			error: 'Unexpected query output'
		};
	} catch (err) {
		return {
			status: 'down',
			error: err instanceof Error ? err.message : 'Database check failed'
		};
	}
}

/**
 * Checks the production database connection.
 */
export function checkDbHealth(): DbHealthResult {
	return checkDatabaseHealth(sqlite);
}
