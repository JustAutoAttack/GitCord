import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { healthRouter } from '@gateway/health';
import { checkDbHealth } from '@database';

vi.mock('@database', () => ({
	checkDbHealth: vi.fn()
}));

const app = new OpenAPIHono();
app.route('/health', healthRouter);

describe('Health Module API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Router Registration Validation ---
	describe('Router initialization', () => {
		it('registers all health routes properly', () => {
			const routes = healthRouter.routes;
			expect(routes.length).toBe(3);
			expect(routes.map((r) => r.path)).toContain('/live');
			expect(routes.map((r) => r.path)).toContain('/ready');
			expect(routes.map((r) => r.path)).toContain('/');
		});
	});

	// --- Liveness Probe (/health/live) ---
	describe('GET /health/live', () => {
		it('returns 200 and success status for liveness check', async () => {
			const res = await app.request('/health/live');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				success: true,
				message: 'Server process is responsive',
				timestamp: expect.any(String)
			});
		});
	});

	// --- Readiness Probe (/health/ready) ---
	describe('GET /health/ready', () => {
		it('returns 200 and success status when database is healthy', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				success: true,
				message: 'Database connection is active and responsive',
				latencyMs: 0.5
			});

			const res = await app.request('/health/ready');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				success: true,
				message: 'Database connection is ready',
				checks: {
					database: { success: true }
				},
				timestamp: expect.any(String)
			});
		});

		it('returns 503 and failure status when database check fails', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				success: false,
				message: 'Connection refused'
			});

			const res = await app.request('/health/ready');
			const body = (await res.json()) as any;

			expect(res.status).toBe(503);
			expect(body).toMatchObject({
				success: false,
				message: 'Database connection failed',
				checks: {
					database: { success: false, message: 'Connection refused' }
				}
			});
		});
	});

	// --- Full Diagnostic Health Check (/health) ---
	describe('GET /health', () => {
		it('returns 200 and operational status with uptime when fully operational', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				success: true,
				message: 'Database connection is active and responsive',
				latencyMs: 0.2
			});

			const res = await app.request('/health');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				success: true,
				message: 'System is fully operational',
				uptimeSeconds: expect.any(Number),
				timestamp: expect.any(String),
				checks: {
					database: { success: true }
				}
			});
		});

		it('returns 503 and degraded status when database is down', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				success: false,
				message: 'Timeout'
			});

			const res = await app.request('/health');
			const body = (await res.json()) as any;

			expect(res.status).toBe(503);
			expect(body).toMatchObject({
				success: false,
				message: 'System is degraded due to database failure',
				uptimeSeconds: expect.any(Number),
				checks: {
					database: { success: false, message: 'Timeout' }
				}
			});
		});
	});
});
