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
		it('returns 200 and UP status for liveness check', async () => {
			const res = await app.request('/health/live');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				status: 'UP',
				timestamp: expect.any(String)
			});
		});
	});

	// --- Readiness Probe (/health/ready) ---
	describe('GET /health/ready', () => {
		it('returns 200 and UP status when database is healthy', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				status: 'up',
				latencyMs: 0.5
			});

			const res = await app.request('/health/ready');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				status: 'UP',
				checks: {
					database: { status: 'up' }
				},
				timestamp: expect.any(String)
			});
		});

		it('returns 503 and DOWN status when database check fails', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				status: 'down',
				error: 'Connection refused'
			});

			const res = await app.request('/health/ready');
			const body = (await res.json()) as any;

			expect(res.status).toBe(503);
			expect(body).toMatchObject({
				status: 'DOWN',
				checks: {
					database: { status: 'down', error: 'Connection refused' }
				}
			});
		});
	});

	// --- Full Diagnostic Health Check (/health) ---
	describe('GET /health', () => {
		it('returns 200 and HEALTHY status with uptime when fully operational', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				status: 'up',
				latencyMs: 0.2
			});

			const res = await app.request('/health');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				status: 'HEALTHY',
				uptimeSeconds: expect.any(Number),
				timestamp: expect.any(String),
				checks: {
					database: { status: 'up' }
				}
			});
		});

		it('returns 503 and DEGRADED status when database is down', async () => {
			vi.mocked(checkDbHealth).mockReturnValueOnce({
				status: 'down',
				error: 'Timeout'
			});

			const res = await app.request('/health');
			const body = (await res.json()) as any;

			expect(res.status).toBe(503);
			expect(body).toMatchObject({
				status: 'DEGRADED',
				uptimeSeconds: expect.any(Number),
				checks: {
					database: { status: 'down', error: 'Timeout' }
				}
			});
		});
	});
});
