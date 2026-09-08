import { describe, it, expect } from 'vitest';
import { asyncLocalStorageService, AppError, ErrorCode } from '@core';

describe('AsyncLocalStorageService', () => {
	const mockContext = {
		serverRequestId: 'req_123',
		clientRequestId: 'client_456',
		userId: 'user_789',
		roles: ['admin', 'user'] as const
	};

	// --- Context Execution and Retrieval ---
	it('runs a callback within context and retrieves full store values', () => {
		const result = asyncLocalStorageService.run(mockContext, () => {
			expect(asyncLocalStorageService.getStore()).toEqual(mockContext);
			expect(asyncLocalStorageService.getServerRequestId()).toBe(
				'req_123'
			);
			expect(asyncLocalStorageService.getClientRequestId()).toBe(
				'client_456'
			);
			expect(asyncLocalStorageService.getUserId()).toBe('user_789');
			expect(asyncLocalStorageService.getRoles()).toEqual([
				'admin',
				'user'
			]);
			return 'done';
		});

		expect(result).toBe('done');
	});

	// --- Inactive Store Fallbacks ---
	it('returns null or empty defaults when store is not active', () => {
		expect(asyncLocalStorageService.getStore()).toBeUndefined();
		expect(asyncLocalStorageService.getClientRequestId()).toBeNull();
		expect(asyncLocalStorageService.getUserId()).toBeNull();
		expect(asyncLocalStorageService.getRoles()).toEqual([]);
	});

	// --- Missing Server Request ID Error ---
	it('throws AppError when server request ID is missing or store is inactive', () => {
		expect(() => asyncLocalStorageService.getServerRequestId()).toThrow(
			AppError
		);

		asyncLocalStorageService.run({ roles: [] } as any, () => {
			expect(() => asyncLocalStorageService.getServerRequestId()).toThrow(
				AppError
			);
			try {
				asyncLocalStorageService.getServerRequestId();
			} catch (error) {
				expect(error).toBeInstanceOf(AppError);
				expect((error as AppError).code).toBe(ErrorCode.INTERNAL_ERROR);
				expect((error as AppError).message).toBe(
					'Request context missing server request ID.'
				);
			}
		});
	});

	// --- Optional Fields Handling ---
	it('handles missing optional fields in context gracefully', () => {
		asyncLocalStorageService.run(
			{ serverRequestId: 'req_partial', roles: [] },
			() => {
				expect(
					asyncLocalStorageService.getClientRequestId()
				).toBeNull();
				expect(asyncLocalStorageService.getUserId()).toBeNull();
				expect(asyncLocalStorageService.getRoles()).toEqual([]);
			}
		);
	});
});
