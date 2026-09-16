import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { healthService } from '@services';
import {
	liveHandler,
	readyHandler,
	fullHealthHandler
} from '../../../../src/gateway/api/health/handlers';
import {
	liveRoute,
	readyRoute,
	fullHealthRoute
} from '../../../../src/gateway/api/health/routes';

// Mock the health service
vi.mock('@services', () => ({
	healthService: {
		getLiveness: vi.fn(),
		getReadiness: vi.fn(),
		getHealthOverview: vi.fn()
	}
}));

// Suppress logger output during tests
vi.mock('../../../../../src/gateway/api/health/logger', () => ({
	logger: {
		debug: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Health Handlers', () => {
    const app = new OpenAPIHono();

    app.openapi(liveRoute, liveHandler);
    app.openapi(readyRoute, readyHandler);
    app.openapi(fullHealthRoute, fullHealthHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /live', () => {
		it('should return 200 and liveness status', async () => {
			const mockResult = {
				success: true,
				message: 'Service is operational',
				timestamp: '2026-09-16T10:00:00.000Z'
			};
			vi.mocked(healthService.getLiveness).mockReturnValue(mockResult);

			const res = await app.request('/live');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockResult);
			expect(healthService.getLiveness).toHaveBeenCalledTimes(1);
		});
	});

	describe('GET /ready', () => {
		it('should return 200 when database is ready', async () => {
			const mockResult = {
				success: true,
				message: 'Database connection is active and responsive',
				timestamp: '2026-09-16T10:00:00.000Z',
				checks: {
					database: {
						success: true,
						message: 'Connected',
						latencyMs: 0.5
					}
				}
			};
			vi.mocked(healthService.getReadiness).mockReturnValue(mockResult);

			const res = await app.request('/ready');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockResult);
		});

		it('should return 503 when database is not ready', async () => {
			const mockResult = {
				success: false,
				message: 'Database connection failure report',
				timestamp: '2026-09-16T10:00:00.000Z',
				checks: {
					database: {
						success: false,
						message: 'Connection timed out'
					}
				}
			};
			vi.mocked(healthService.getReadiness).mockReturnValue(mockResult);

			const res = await app.request('/ready');
			const body = await res.json();

			expect(res.status).toBe(503);
			expect(body).toEqual(mockResult);
		});
	});

	describe('GET / (Full Health Overview)', () => {
		it('should return 200 when all health checks pass', async () => {
			const mockResult = {
				success: true,
				message: 'System healthy',
				timestamp: '2026-09-16T10:00:00.000Z',
				uptimeSeconds: 1200,
				checks: {
					database: {
						success: true,
						message: 'OK',
						latencyMs: 0.2
					}
				}
			};
			vi.mocked(healthService.getHealthOverview).mockReturnValue(
				mockResult
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockResult);
		});

		it('should return 503 when full health check reports degradation', async () => {
			const mockResult = {
				success: false,
				message: 'System degraded',
				timestamp: '2026-09-16T10:00:00.000Z',
				uptimeSeconds: 1200,
				checks: {
					database: {
						success: false,
						message: 'Error'
					}
				}
			};
			vi.mocked(healthService.getHealthOverview).mockReturnValue(
				mockResult
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(503);
			expect(body).toEqual(mockResult);
		});
	});
});
