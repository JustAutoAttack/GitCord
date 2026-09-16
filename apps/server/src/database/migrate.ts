import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import { ENV } from '@core';
import { logger } from './logger';

function resolveDatabasePath(): string {
	const rawPath = ENV.DATABASE_URL.replace(/^file:/, '');

	return path.resolve(process.cwd(), rawPath);
}

function resolveMigrationsPath(): string {
	return path.resolve(process.cwd(), 'database/migrations');
}

export function migrateDatabase(): void {
	const dbPath = resolveDatabasePath();
	const migrationsDir = resolveMigrationsPath();

	const dbDir = path.dirname(dbPath);

	if (!fs.existsSync(dbDir)) {
		logger.info(
			`Creating missing database directory for migrations: ${dbDir}`
		);
		fs.mkdirSync(dbDir, { recursive: true });
	}

	if (!fs.existsSync(migrationsDir)) {
		logger.error(
			`CRITICAL: Database migrations directory does not exist: ${migrationsDir}`
		);
		throw new Error(
			`Database migrations directory does not exist: ${migrationsDir}`
		);
	}

	logger.info(
		`Opening database connection for migration runner at: ${dbPath}`
	);
	const sqlite = new Database(dbPath);

	try {
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE IF NOT EXISTS _gitcord_migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL UNIQUE,
                applied_at TEXT NOT NULL
            );
        `);

		const migrationFiles = fs
			.readdirSync(migrationsDir)
			.filter((file) => file.endsWith('.sql'))
			.sort();

		const appliedMigrations = new Set(
			(
				sqlite
					.prepare(
						'SELECT filename FROM _gitcord_migrations ORDER BY filename'
					)
					.all() as Array<{ filename: string }>
			).map((migration) => migration.filename)
		);

		const insertMigration = sqlite.prepare(`
            INSERT INTO _gitcord_migrations (
                filename,
                applied_at
            )
            VALUES (?, ?)
        `);

		let appliedCount = 0;

		for (const filename of migrationFiles) {
			if (appliedMigrations.has(filename)) {
				continue;
			}

			const filePath = path.join(migrationsDir, filename);
			const sql = fs.readFileSync(filePath, 'utf8');

			logger.info(`Applying database migration: ${filename}`);

			sqlite.exec(sql);

			insertMigration.run(filename, new Date().toISOString());

			appliedCount++;
		}

		if (appliedCount === 0) {
			logger.info('Database is up to date.');
		} else {
			logger.info(
				`Successfully applied ${appliedCount} database migration${
					appliedCount === 1 ? '' : 's'
				}.`
			);
		}
	} catch (error) {
		logger.error(
			`CRITICAL: Migration execution failed: ${error instanceof Error ? error.message : String(error)}`
		);
		throw error;
	} finally {
		sqlite.close();
		logger.info('Migration runner closed database connection.');
	}
}
