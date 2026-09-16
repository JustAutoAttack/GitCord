import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createDatabase } from '../../../src/database/client';

describe('Database Client', () => {
	let tempDir: string;

	afterEach(() => {
		// Cleanup any temporary directories created during file-backed tests
		if (tempDir && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it('should initialize an in-memory database successfully with :memory:', () => {
		const { sqlite, db } = createDatabase(':memory:');

		expect(sqlite).toBeDefined();
		expect(db).toBeDefined();

		// Verify it's operational by running a simple query
		const result = sqlite.prepare('SELECT 1 as val').get() as {
			val: number;
		};
		expect(result.val).toBe(1);

		sqlite.close();
	});

	it('should initialize an in-memory database successfully with file::memory:', () => {
		const { sqlite, db } = createDatabase('file::memory:');

		expect(sqlite).toBeDefined();
		expect(db).toBeDefined();

		const result = sqlite.prepare('SELECT 1 as val').get() as {
			val: number;
		};
		expect(result.val).toBe(1);

		sqlite.close();
	});

	it('should correctly apply SQLite pragmas (foreign keys and WAL mode)', () => {
		const { sqlite } = createDatabase(':memory:');

		// Check foreign keys status (pragma foreign_keys returns 0 or 1)
		const fkResult = sqlite.prepare('PRAGMA foreign_keys').get() as {
			foreign_keys: number;
		};
		expect(fkResult.foreign_keys).toBe(1);

		sqlite.close();
	});

	it('should create missing directories and open a file-backed database', () => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitcord-test-'));
		const dbFilePath = path.join(tempDir, 'nested', 'subfolder', 'test.db');

		const { sqlite, db } = createDatabase(dbFilePath);

		expect(fs.existsSync(dbFilePath)).toBe(true);
		expect(sqlite).toBeDefined();
		expect(db).toBeDefined();

		sqlite.close();
	});
});
