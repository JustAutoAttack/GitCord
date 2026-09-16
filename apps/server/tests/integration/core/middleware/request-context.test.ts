import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { requestContextMiddleware } from '../../../../src/core/middleware/request-context.js';
import { asyncLocalStorageService } from '../../../../src/core/services/index.js';

describe('RequestContext Middleware Integration', () => {
	beforeEach(() => {
		// Clear any previous async local storage state
	});

	it('should inject request ID header and store context in AsyncLocalStorage', async () => {
		const app = new Hono();
		app.use(requestContextMiddleware);

		let capturedContext: any = null;
		app.get('/context', (c) => {
			capturedContext = asyncLocalStorageService.getStore();
			return c.json({ requestId: c.req.header('X-Request-ID') });
		});

		const res = await app.request('/context', {
			headers: {
				'X-Request-ID': 'custom-req-id-123',
				'User-Agent': 'Vitest-Agent',
				'X-Forwarded-For': '203.0.113.195, 70.41.3.18'
			}
		});

		const body = await res.json();

		expect(res.headers.get('X-Request-ID')).toBe('custom-req-id-123');
		expect(capturedContext).toBeDefined();
		expect(capturedContext.serverRequestId).toBe('custom-req-id-123');
		expect(capturedContext.userAgent).toBe('Vitest-Agent');
		expect(capturedContext.ipAddress).toBe('203.0.113.195');
	});

	it('should generate a server request ID and default IP if headers are omitted', async () => {
		const app = new Hono();
		app.use(requestContextMiddleware);

		let capturedContext: any = null;
		app.get('/context-defaults', (c) => {
			capturedContext = asyncLocalStorageService.getStore();
			return c.text('OK');
		});

		const res = await app.request('/context-defaults');

		expect(res.headers.get('X-Request-ID')).toBeDefined();
		expect(capturedContext.serverRequestId).toBe(
			res.headers.get('X-Request-ID')
		);
		expect(capturedContext.ipAddress).toBe('127.0.0.1');
	});
});
