import { describe, expect, it, vi } from 'vitest';
import { HealthService } from '@services/health';
import * as databaseHealth from '@database/health';

describe('HealthService', () => {
	it('returns successful liveness response', () => {
		const service = new HealthService();
		const result = service.getLiveness();

		expect(result.success).toBe(true);
		expect(result.message).toBe('Server process is responsive');
		expect(result.timestamp).toEqual(expect.any(String));
	});

	it('returns successful readiness response when database is healthy', () => {
		vi.spyOn(databaseHealth, 'checkDbHealth').mockReturnValue({
			success: true,
			message: 'Database connection is active and responsive',
			latencyMs: 0.5
		});

		const service = new HealthService();
		const result = service.getReadiness();

		expect(result.success).toBe(true);
		expect(result.message).toBe('Database connection is ready');
		expect(result.checks.database.success).toBe(true);
	});

	it('returns failed readiness response when database is unhealthy', () => {
		vi.spyOn(databaseHealth, 'checkDbHealth').mockReturnValue({
			success: false,
			message: 'connection lost'
		});

		const service = new HealthService();
		const result = service.getReadiness();

		expect(result.success).toBe(false);
		expect(result.message).toBe('Database connection failed');
		expect(result.checks.database.success).toBe(false);
	});

	it('returns successful health overview when database is healthy', () => {~
		vi.spyOn(databaseHealth, 'checkDbHealth').mockReturnValue({
			success: true,
			message: 'Database connection is active and responsive',
			latencyMs: 0.4
		});

		const service = new HealthService();
		const result = service.getHealthOverview();

		expect(result.success).toBe(true);
		expect(result.message).toBe('System is fully operational');
		expect(result.uptimeSeconds).toEqual(expect.any(Number));
		expect(result.checks.database.success).toBe(true);
	});

	it('returns degraded health overview when database fails', () => {
		vi.spyOn(databaseHealth, 'checkDbHealth').mockReturnValue({
			success: false,
			message: 'Database check failed'
		});

		const service = new HealthService();
		const result = service.getHealthOverview();

		expect(result.success).toBe(false);
		expect(result.message).toBe(
			'System is degraded due to database failure'
		);
		expect(result.checks.database.success).toBe(false);
	});
});
