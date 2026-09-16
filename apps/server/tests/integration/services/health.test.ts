import { describe, it, expect, vi, beforeEach } from 'vitest';
import { healthService } from '../../../src/services/health';
import { checkDbHealth } from '@database';
import { appLogger } from '../../../src/core';

// Mock the database health check module
vi.mock('@database', () => ({
	checkDbHealth: vi.fn()
}));

// Mock the app logger to keep test output clean and verify logging calls
vi.mock('../../../src/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/core')>();
	return {
		...actual,
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('HealthService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	describe('getLiveness', () => {
		it('should return a successful liveness response and log debug message', () => {
			const result = healthService.getLiveness();

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Liveness probe check requested.'
			);
			expect(result.success).toBe(true);
			expect(result.message).toBe('Server process is responsive');
			expect(typeof result.timestamp).toBe('string');
		});
	});

	describe('getReadiness', () => {
		it('should return successful readiness status when database check succeeds', () => {
			vi.mocked(checkDbHealth).mockReturnValue({
				success: true,
				message: 'Connected successfully'
			});

			const result = healthService.getReadiness();

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Readiness probe check requested.'
			);
			expect(appLogger.warn).not.toHaveBeenCalled();
			expect(result.success).toBe(true);
			expect(result.message).toBe('Database connection is ready');
			expect(result.checks.database.success).toBe(true);
		});

		it('should return failed readiness status and log warning when database check fails', () => {
			vi.mocked(checkDbHealth).mockReturnValue({
				success: false,
				message: 'Connection timed out'
			});

			const result = healthService.getReadiness();

			expect(appLogger.warn).toHaveBeenCalledWith(
				'Readiness check failed: Database connection issue detected. Message: Connection timed out'
			);
			expect(result.success).toBe(false);
			expect(result.message).toBe('Database connection failed');
			expect(result.checks.database.success).toBe(false);
		});
	});

	describe('getHealthOverview', () => {
		it('should return fully operational status when database check succeeds', () => {
			vi.mocked(checkDbHealth).mockReturnValue({
				success: true,
				message: 'Healthy'
			});

			const result = healthService.getHealthOverview();

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Full health overview requested.'
			);
			expect(appLogger.error).not.toHaveBeenCalled();
			expect(result.success).toBe(true);
			expect(result.message).toBe('System is fully operational');
			expect(typeof result.uptimeSeconds).toBe('number');
			expect(result.checks.database.success).toBe(true);
		});

		it('should return degraded status and log error when database check fails', () => {
			vi.mocked(checkDbHealth).mockReturnValue({
				success: false,
				message: 'Disk I/O error'
			});

			const result = healthService.getHealthOverview();

			expect(appLogger.error).toHaveBeenCalledWith(
				'System health degradation detected: Database failure during full health overview. Message: Disk I/O error'
			);
			expect(result.success).toBe(false);
			expect(result.message).toBe(
				'System is degraded due to database failure'
			);
			expect(result.checks.database.success).toBe(false);
		});
	});
});
