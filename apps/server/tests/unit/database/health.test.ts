import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { createDatabase } from '@database/client';
import { checkDatabaseHealth, checkDbHealth } from '@database/health';

describe('Database Health Checks', () => {
	it('reports the database as up', () => {
		const database = createDatabase(':memory:');

		try {
			const result = checkDatabaseHealth(database.sqlite);

			expect(result.success).toBe(true);
			expect(result.latencyMs).toEqual(expect.any(Number));
			expect(result.latencyMs!).toBeGreaterThanOrEqual(0);
		} finally {
			database.sqlite.close();
		}
	});

	it('checks the global singleton database health', () => {
		const result = checkDbHealth();

		expect(result.success).toBe(true);
		expect(result.latencyMs!).toBeGreaterThanOrEqual(0);
	});

	it('reports the database as down when the connection is closed', () => {
		const database = createDatabase(':memory:');
		database.sqlite.close();

		const result = checkDatabaseHealth(database.sqlite);

		expect(result.success).toBe(false);
		expect(result.message).toEqual(expect.any(String));
	});

	it('reports the database as down when query output is unexpected', () => {
		const mockDb = {
			prepare: () => ({
				get: () => ({ alive: 0 })
			})
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Unexpected query output');
	});

	it('reports the database as down when an exception occurs during the check', () => {
		const mockDb = {
			prepare: () => {
				throw new Error('connection lost');
			}
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('connection lost');
	});

	it('reports the database as down with a default message when a non-Error is thrown', () => {
		const mockDb = {
			prepare: () => {
				throw 'string-based failure';
			}
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Database check failed');
	});
});
