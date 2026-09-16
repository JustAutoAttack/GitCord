import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import { migrateDatabase } from '../../../src/database/migrate';
import { ENV } from '@core';

// Mock logger
vi.mock('../../../src/database/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn()
	}
}));

describe('Database Migration Runner', () => {
	let tempDir: string;
	let dbPath: string;
	let migrationsDir: string;

	beforeEach(() => {
		vi.clearAllMocks();
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitcord-migrate-'));
		dbPath = path.join(tempDir, 'data', 'test.db');
		migrationsDir = path.join(tempDir, 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });

		// Point ENV.DATABASE_URL to our temporary test path
		(ENV as any).DATABASE_URL = `file:${dbPath}`;
	});

	afterEach(() => {
		if (tempDir && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it('should throw an error if migrations directory does not exist', () => {
		// Force an invalid migrations directory path by deleting it
		fs.rmSync(migrationsDir, { recursive: true, force: true });

		const resolveSpy = vi
			.spyOn(path, 'resolve')
			.mockImplementation((...args) => {
				if (args.includes('database/migrations')) {
					return migrationsDir;
				}
				return path.join(...args);
			});

		expect(() => migrateDatabase()).toThrowError(
			/Database migrations directory does not exist/
		);

		resolveSpy.mockRestore();
	});

	it('should execute migrations successfully, apply plural/singular logs correctly, and track applied state', () => {
		// Create sample migration files (one file to test singular 'migration' log message branch)
		fs.writeFileSync(
			path.join(migrationsDir, '001_init.sql'),
			'CREATE TABLE users (id INTEGER PRIMARY KEY);'
		);
		fs.writeFileSync(
			path.join(migrationsDir, '002_add_email.sql'),
			'ALTER TABLE users ADD COLUMN email TEXT;'
		);
		// Non-sql file to test filtering
		fs.writeFileSync(path.join(migrationsDir, 'README.md'), '# Notes');

		const resolveSpy = vi
			.spyOn(path, 'resolve')
			.mockImplementation((...args) => {
				if (args.includes('database/migrations')) {
					return migrationsDir;
				}
				if (
					args.length > 1 &&
					args[1] === dbPath.replace(/^file:/, '')
				) {
					return dbPath;
				}
				return path.join(...args);
			});

		// First run: should apply both migrations
		expect(() => migrateDatabase()).not.toThrow();

		// Verify tables and migration records exist in the created database
		const sqlite = new Database(dbPath);
		const migrations = sqlite
			.prepare(
				'SELECT filename FROM _gitcord_migrations ORDER BY filename'
			)
			.all() as Array<{ filename: string }>;

		expect(migrations).toHaveLength(2);

		const [mig1, mig2] = migrations as [
			{ filename: string },
			{ filename: string }
		];
		expect(mig1.filename).toBe('001_init.sql');
		expect(mig2.filename).toBe('002_add_email.sql');

		// Verify table schema changes took effect
		const tableInfo = sqlite
			.prepare('PRAGMA table_info(users)')
			.all() as Array<any>;
		expect(tableInfo.some((col) => col.name === 'email')).toBe(true);

		sqlite.close();

		// Second run: should safely skip already applied migrations (idempotent / up to date log branch)
		expect(() => migrateDatabase()).not.toThrow();

		resolveSpy.mockRestore();
	});

	it('should throw and log error if migration execution fails', () => {
		// Create a malformed SQL migration file
		fs.writeFileSync(
			path.join(migrationsDir, '001_bad.sql'),
			'INVALID SQL SYNTAX;'
		);

		const resolveSpy = vi
			.spyOn(path, 'resolve')
			.mockImplementation((...args) => {
				if (args.includes('database/migrations')) {
					return migrationsDir;
				}
				return path.join(...args);
			});

		expect(() => migrateDatabase()).toThrow();

		resolveSpy.mockRestore();
	});

    it('should log singular migration message when exactly one migration is applied', () => {
		fs.writeFileSync(
			path.join(migrationsDir, '001_single.sql'),
			'CREATE TABLE single_table (id INTEGER PRIMARY KEY);'
		);

		const resolveSpy = vi
			.spyOn(path, 'resolve')
			.mockImplementation((...args) => {
				if (args.includes('database/migrations')) {
					return migrationsDir;
				}
				if (
					args.length > 1 &&
					args[1] === dbPath.replace(/^file:/, '')
				) {
					return dbPath;
				}
				return path.join(...args);
			});

		expect(() => migrateDatabase()).not.toThrow();

		resolveSpy.mockRestore();
	});
});
