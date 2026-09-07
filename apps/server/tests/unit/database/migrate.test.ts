import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { migrateDatabase } from '@database/migrate';

let mockDatabaseUrl = '';

vi.mock('@core', () => ({
	get ENV() {
		return { DATABASE_URL: mockDatabaseUrl };
	}
}));

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

	// --- Missing Migrations Directory ---
	it('throws an error if the migrations directory does not exist', () => {
		mockDatabaseUrl = path.join(tempDir, 'data', 'test.db');

		expect(() => migrateDatabase()).toThrowError(
			/Database migrations directory does not exist/
		);
	});

	// --- Fresh Run & Single Migration ---
	it('creates database directory, applies a single migration, and logs correctly', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_init.sql'),
			'CREATE TABLE test_table (id INTEGER PRIMARY KEY);'
		);

		mockDatabaseUrl = dbPath;
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith('Applied 1 database migration.');
		expect(fs.existsSync(dbPath)).toBe(true);
	});

	// --- Up-to-Date Status ---
	it('reports that the database is up to date when no new migrations exist', () => {
		const dbPath = path.join(tempDir, 'data', 'test.db');
		const migrationsDir = path.join(tempDir, 'database', 'migrations');

		fs.mkdirSync(migrationsDir, { recursive: true });
		fs.writeFileSync(
			path.join(migrationsDir, '001_init.sql'),
			'CREATE TABLE test_table (id INTEGER PRIMARY KEY);'
		);

		mockDatabaseUrl = dbPath;
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		// First run applies the migration
		migrateDatabase();

		// Second run should find nothing new
		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith('Database is up to date.');
	});

	// --- Multiple Migrations (Plural) ---
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
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		migrateDatabase();

		expect(logSpy).toHaveBeenCalledWith('Applied 2 database migrations.');
	});
});
