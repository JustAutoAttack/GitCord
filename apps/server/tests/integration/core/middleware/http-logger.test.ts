import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { httpLoggerMiddleware } from '../../../../src/core/middleware/http-logger.js';
import { appLogger } from '../../../../src/core/loggers.js';

vi.mock('../../../../src/core/loggers.js', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('HttpLogger Middleware Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should log incoming requests and successful completions', async () => {
		const app = new Hono();
		app.use(httpLoggerMiddleware());

		app.get('/success', (c) => c.text('OK'));

		const res = await app.request('/success');
		expect(res.status).toBe(200);

		expect(appLogger.info).toHaveBeenCalledWith(
			'Incoming request: GET /success'
		);
		expect(appLogger.info).toHaveBeenCalledWith(
			expect.stringMatching(
				/^Request completed: GET \/success - Status: 200 - Duration: \d+(\.\d+)?ms$/
			)
		);
	});

	it('should log warnings for client errors (status >= 400)', async () => {
		const app = new Hono();
		app.use(httpLoggerMiddleware());

		app.get('/not-found', (c) => c.text('Not Found', 404));

		const res = await app.request('/not-found');
		expect(res.status).toBe(404);

		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringMatching(
				/^Request client error: GET \/not-found - Status: 404 - Duration: \d+(\.\d+)?ms$/
			)
		);
	});

	it('should log errors for server errors (status >= 500)', async () => {
		const app = new Hono();
		app.use(httpLoggerMiddleware());

		app.get('/server-error', (c) => c.text('Fail', 500));

		const res = await app.request('/server-error');
		expect(res.status).toBe(500);

		expect(appLogger.error).toHaveBeenCalledWith(
			expect.stringMatching(
				/^Request failed: GET \/server-error - Status: 500 - Duration: \d+(\.\d+)?ms$/
			)
		);
	});
});
