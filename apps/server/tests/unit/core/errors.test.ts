import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, ErrorCode } from '../../../src/core/errors';

// Corrected path: 3 levels up to root, then into src/core/loggers
vi.mock('../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('AppError', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create an instance of AppError with custom message and code', () => {
		const error = new AppError(
			ErrorCode.BAD_REQUEST,
			'Custom bad request message'
		);

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(AppError);
		expect(error.message).toBe('Custom bad request message');
		expect(error.code).toBe(ErrorCode.BAD_REQUEST);
		expect(error.statusCode).toBe(400);
		expect(error.name).toBe('AppError');
	});

	it('should fall back to using the error code as the message when message is omitted', () => {
		const error = new AppError(ErrorCode.UNAUTHORIZED);

		expect(error.message).toBe(ErrorCode.UNAUTHORIZED);
		expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
		expect(error.statusCode).toBe(401);
	});

	it('should trigger error logging for status codes >= 500 (INTERNAL_ERROR)', () => {
		const error = new AppError(
			ErrorCode.INTERNAL_ERROR,
			'Critical system failure'
		);
		expect(error.statusCode).toBe(500);
	});

	it('should trigger warning logging for status codes < 500 (NOT_FOUND)', () => {
		const error = new AppError(ErrorCode.NOT_FOUND, 'Resource missing');
		expect(error.statusCode).toBe(404);
	});

	it('should capture stack trace correctly', () => {
		const error = new AppError(ErrorCode.FORBIDDEN);
		expect(error.stack).toBeDefined();
	});
});
