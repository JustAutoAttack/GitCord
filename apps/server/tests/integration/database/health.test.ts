import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
	checkDatabaseHealth,
	checkDbHealth
} from '../../../src/database/health';
import { logger } from '../../../src/database/logger';

// Mock logger to keep test output clean
vi.mock('../../../src/database/logger', () => ({
	logger: {
		error: vi.fn(),
		info: vi.fn()
	}
}));

describe('Database Health Check', () => {
	let sqlite: Database.Database;

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should report healthy when database returns active signal', () => {
		const result = checkDatabaseHealth(sqlite);

		expect(result.success).toBe(true);
		expect(result.message).toBe(
			'Database connection is active and responsive'
		);
		expect(typeof result.latencyMs).toBe('number');
	});

	it('should report unhealthy when query output is unexpected', () => {
		// Create an incompatible table or mock a scenario where alive !== 1
		// E.g., we can pass a mock database object whose prepare().get() returns something else
		const mockDb = {
			prepare: vi.fn().mockReturnValue({
				get: vi.fn().mockReturnValue({ alive: 0 })
			})
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Unexpected query output');
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining(
				'Database health check returned unexpected output'
			)
		);
	});

	it('should handle exceptions gracefully during health probe', () => {
		const mockDb = {
			prepare: vi.fn().mockImplementation(() => {
				throw new Error('Disk failure');
			})
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Disk failure');
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining(
				'Database health check failed with exception: Disk failure'
			)
		);
	});

	it('should handle non-Error exceptions gracefully', () => {
		const mockDb = {
			prepare: vi.fn().mockImplementation(() => {
				throw 'Critical string panic';
			})
		} as unknown as Database.Database;

		const result = checkDatabaseHealth(mockDb);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Database check failed');
	});

	it('should execute checkDbHealth successfully using the singleton sqlite instance', () => {
		const result = checkDbHealth();
		expect(result.success).toBe(true);
	});
});
