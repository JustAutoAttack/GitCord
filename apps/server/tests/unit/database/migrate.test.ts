import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseLogger } from '@core';
import { migrateDatabase } from '@database/migrate';

let mockDatabaseUrl = '';

vi.mock('@core', async () => {
	const actual = await vi.importActual<typeof import('@core')>('@core');
	return {
		...actual,
		get ENV() {
			return { DATABASE_URL: mockDatabaseUrl };
		}
	};
});

describe('migrateDatabase', () => {
	let tempDir: string;
	let originalCwd: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitcord-migrate-'));
		originalCwd = process.cwd();

		vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it('throws an error if the migrations directory does not exist', () => {
		mockDatabaseUrl = path.join(tempDir, 'data', 'test.db');

		expect(() => migrateDatabase()).toThrowError(
			/Database migrations directory does not exist/
		);
	});

	it('creates database directory, applies a single migration, and logs correctly', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_init.sql'),
			'CREATE TABLE test_table (id INTEGER PRIMARY KEY);'
		);

		mockDatabaseUrl = dbPath;
		const logSpy = vi
			.spyOn(databaseLogger, 'info')
			.mockImplementation(() => {});

		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith(
			'Successfully applied 1 database migration.'
		);
		expect(fs.existsSync(dbPath)).toBe(true);
	});

	it('reports that the database is up to date when no new migrations exist', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_init.sql'),
			'CREATE TABLE test_table (id INTEGER PRIMARY KEY);'
		);

		mockDatabaseUrl = dbPath;
		vi.spyOn(databaseLogger, 'info').mockImplementation(() => {});

		migrateDatabase();

		const logSpy = vi
			.spyOn(databaseLogger, 'info')
			.mockImplementation(() => {});
		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith('Database is up to date.');
	});

	it('applies multiple migrations and uses plural log output', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_first.sql'),
			'CREATE TABLE t1 (id INT);'
		);
		fs.writeFileSync(
			path.join(migrationsDir, '002_second.sql'),
			'CREATE TABLE t2 (id INT);'
		);

		mockDatabaseUrl = dbPath;
		const logSpy = vi
			.spyOn(databaseLogger, 'info')
			.mockImplementation(() => {});

		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith(
			'Successfully applied 2 database migrations.'
		);
	});

	it('catches and logs errors when migration execution fails', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_invalid.sql'),
			'INVALID SQL SYNTAX;'
		);

		mockDatabaseUrl = dbPath;
		const errorLogSpy = vi
			.spyOn(databaseLogger, 'error')
			.mockImplementation(() => {});

		expect(() => migrateDatabase()).toThrow();
		expect(errorLogSpy).toHaveBeenCalledWith(
			expect.stringContaining('CRITICAL: Migration execution failed:')
		);
	});
});
