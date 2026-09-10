import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { ENV, databaseLogger } from '@core';
import * as schema from './generated/schema';

export interface DatabaseClient {
	sqlite: Database.Database;
	db: ReturnType<typeof drizzle>;
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

	databaseLogger.info(
		`Initializing database connection (mode: ${isMemoryDatabase ? 'in-memory' : 'file-backed'})...`
	);

	const sqlite = isMemoryDatabase
		? new Database(':memory:')
		: createFileDatabase(databaseUrl);

	// SQLite performance and integrity settings.
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	sqlite.pragma('synchronous = NORMAL');

	databaseLogger.info(
		'SQLite pragmas applied (WAL, foreign_keys=ON, synchronous=NORMAL).'
	);

	const db = drizzle(sqlite, {
		schema
	});

	databaseLogger.info('Drizzle ORM client successfully initialized.');

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
		databaseLogger.info(`Creating missing database directory: ${dbDir}`);
		fs.mkdirSync(dbDir, { recursive: true });
	}

	databaseLogger.info(`Opening file-backed SQLite database at: ${dbPath}`);
	return new Database(dbPath);
}

const database = createDatabase(ENV.DATABASE_URL);

export const sqlite = database.sqlite;
export const db = database.db;
