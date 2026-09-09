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

export interface DbHealthResult {
	success: boolean;
	message: string;
	latencyMs?: number;
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

		const latencyMs = Number((performance.now() - start).toFixed(2));

		if (row?.alive === 1) {
			return {
				success: true,
				message: 'Database connection is active and responsive',
				latencyMs
			};
		}

		databaseLogger.error(
			'CRITICAL: Database health check returned unexpected output (row.alive !== 1).'
		);
		return {
			success: false,
			message: 'Database check returned unexpected output'
		};
	} catch (error) {
		const errorMsg =
			error instanceof Error ? error.message : 'Database check failed';
		databaseLogger.error(
			`CRITICAL: Database health check failed with exception: ${errorMsg}`
		);
		return {
			success: false,
			message: errorMsg
		};
	}
}

/**
 * Checks the production database connection.
 */
export function checkDbHealth(): DbHealthResult {
	return checkDatabaseHealth(sqlite);
}
