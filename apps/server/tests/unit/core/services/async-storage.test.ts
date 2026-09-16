import { describe, it, expect, vi } from 'vitest';
import {
	AsyncLocalStorageService,
	asyncLocalStorageService
} from '../../../../src/core/services/async-storage';
import { AppError, ErrorCode } from '../../../../src/core';

// Mock appLogger to silence expected error prints in tests
vi.mock('../../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('AsyncLocalStorageService', () => {
	const service = new AsyncLocalStorageService();

	it('should run a callback within context and return its result', () => {
		const context = { serverRequestId: 'req-123', timestamp: Date.now() };
		const result = service.run(context, () => {
			const store = service.getStore();
			expect(store).toEqual(context);
			return 'success';
		});

		expect(result).toBe('success');
		expect(service.getStore()).toBeUndefined();
	});

	it('should update the current store using updateStore', () => {
		const context: any = {
			serverRequestId: 'req-456',
			timestamp: Date.now()
		};
		service.run(context, () => {
			service.updateStore((store) => {
				store.auth = { userId: 'user-789', roles: ['admin'] };
			});

			expect(service.getUserId()).toBe('user-789');
			expect(service.getRoles()).toEqual(['admin']);
		});
	});

	it('should do nothing when updateStore is called outside of a run context', () => {
		expect(() => {
			service.updateStore((store) => {
				store.auth = { userId: 'unreachable', roles: [] };
			});
		}).not.toThrow();
		expect(service.getStore()).toBeUndefined();
	});

	it('should throw AppError if getServerRequestId is called outside context or missing id', () => {
		expect(() => service.getServerRequestId()).toThrow(AppError);

		service.run({ serverRequestId: '', timestamp: Date.now() }, () => {
			expect(() => service.getServerRequestId()).toThrowError(
				expect.objectContaining({ code: ErrorCode.INTERNAL_ERROR })
			);
		});
	});

	it('should retrieve serverRequestId, userId, and roles correctly from store', () => {
		const context = {
			serverRequestId: 'req-xyz',
			timestamp: Date.now(),
			auth: { userId: 'user-111', roles: ['user', 'moderator'] }
		};

		service.run(context, () => {
			expect(service.getServerRequestId()).toBe('req-xyz');
			expect(service.getUserId()).toBe('user-111');
			expect(service.getRoles()).toEqual(['user', 'moderator']);
		});
	});

	it('should return safe fallback values when auth is missing', () => {
		service.run(
			{ serverRequestId: 'req-abc', timestamp: Date.now() },
			() => {
				expect(service.getUserId()).toBeNull();
				expect(service.getRoles()).toEqual([]);
			}
		);
	});

	it('should export a working singleton instance', () => {
		expect(asyncLocalStorageService).toBeInstanceOf(
			AsyncLocalStorageService
		);
	});
});
