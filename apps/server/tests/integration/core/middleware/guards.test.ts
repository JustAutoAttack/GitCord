import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { requireAuth } from '../../../../src/core/middleware/guards.js';
import { requestContextMiddleware } from '../../../../src/core/middleware/request-context.js';
import { errorHandlerMiddleware } from '../../../../src/core/middleware/error-handler.js';
import { jwtService } from '../../../../src/core/services/index.js';
import { asyncLocalStorageService } from '../../../../src/core/services/index.js';

// Mock jwtService
vi.mock('../../../../src/core/services/index.js', async (importOriginal) => {
	const actual =
		await importOriginal<
			typeof import('../../../../src/core/services/index.js')
		>();
	return {
		...actual,
		jwtService: {
			verify: vi.fn()
		}
	};
});

describe('Guards Middleware Integration (`requireAuth`)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should throw unauthorized error if Authorization header is missing', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected');
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Authentication token required'
		});
	});

	it('should throw unauthorized error if Authorization header does not start with Bearer', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected', {
			headers: { Authorization: 'Basic some-token' }
		});
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Authentication token required'
		});
	});

    it('should throw unauthorized error if Authorization header is just "Bearer" without space', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected', {
			headers: { Authorization: 'Bearer' }
		});
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Authentication token required'
		});
	});

    it('should throw unauthorized error if Authorization header contains spaces instead of a token', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected', {
			headers: { Authorization: 'Bearer    ' }
		});
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Authentication token required'
		});
	});
    
	it('should throw unauthorized error if token value is empty after Bearer', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected', {
			headers: { Authorization: 'Bearer ' }
		});
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Authentication token required'
		});
	});

	it('should throw unauthorized error if jwtService.verify returns null/invalid payload', async () => {
		vi.mocked(jwtService.verify).mockReturnValue(null as any);

		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		app.use(requireAuth);
		app.get('/protected', (c) => c.text('OK'));

		const res = await app.request('/protected', {
			headers: { Authorization: 'Bearer invalid-token' }
		});
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Invalid or expired token'
		});
	});

	it('should successfully authenticate, update async storage, and pass to next handler on valid token', async () => {
		vi.mocked(jwtService.verify).mockReturnValue({
			sub: 'user-xyz-123',
			type: 'access'
		} as any);

		const app = new Hono();
		app.onError(errorHandlerMiddleware());
		// Wrap with requestContextMiddleware so asyncLocalStorage store exists
		app.use(requestContextMiddleware);
		app.use(requireAuth);

		let userIdFromStore: string | null = null;
		app.get('/protected', (c) => {
			userIdFromStore = asyncLocalStorageService.getUserId();
			return c.json({ status: 'granted' });
		});

		const res = await app.request('/protected', {
			headers: { Authorization: 'Bearer valid-jwt-token' }
		});
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body).toEqual({ status: 'granted' });
		expect(userIdFromStore).toBe('user-xyz-123');
		expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
	});
});
