import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { errorHandlerMiddleware } from '../../../../src/core/middleware/error-handler.js';
import { AppError, ErrorCode } from '../../../../src/core/errors/index.js';
import { appLogger } from '../../../../src/core/loggers.js';

vi.mock('../../../../src/core/loggers.js', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('ErrorHandler Middleware Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should catch AppError and format a structured error response', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());

		app.get('/test-error', () => {
			throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid credentials');
		});

		const res = await app.request('/test-error');
		const body = await res.json();

		expect(res.status).toBe(401);
		expect(body).toEqual({
			success: false,
			error: 'Invalid credentials'
		});
	});

	it('should catch unhandled exceptions, log them, and return a 500 INTERNAL_ERROR response', async () => {
		const app = new Hono();
		app.onError(errorHandlerMiddleware());

		app.get('/fatal-error', () => {
			throw new Error('Database connection dropped');
		});

		const res = await app.request('/fatal-error');
		const body = await res.json();

		expect(res.status).toBe(500);
		expect(body).toEqual({
			success: false,
			error: 'Database connection dropped'
		});
		expect(appLogger.error).toHaveBeenCalledWith(
			expect.stringContaining(
				'CRITICAL: Unhandled exception caught in global error boundary: Database connection dropped'
			)
		);
	});
});
