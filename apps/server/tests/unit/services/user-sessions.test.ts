import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserSession } from '@domain';
import { userSessionsService } from '../../../src/services/user-sessions';
import { userSessionsRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		userSessionsRepo: {
			findAll: vi.fn(),
			findById: vi.fn(),
			findByUserId: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		}
	};
});

// Mock the logger to keep test output clean
vi.mock('../../../src/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/core')>();
	return {
		...actual,
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('UserSessionsService', () => {
	const mockSession: UserSession.Model = {
		id: 'sess-1',
		userId: 'user-1',
		accessTokenEncrypted: 'enc-acc',
		refreshTokenEncrypted: 'enc-ref',
		expiresAt: '2026-10-01T00:00:00.000Z',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getByUserId', () => {
		it('should return the user session when found by user ID', async () => {
			vi.mocked(userSessionsRepo.findByUserId).mockReturnValue(
				mockSession
			);

			const result = await userSessionsService.getByUserId('user-1');

			expect(userSessionsRepo.findByUserId).toHaveBeenCalledWith(
				'user-1'
			);
			expect(result).toEqual(mockSession);
		});

		it('should return null when no session is found by user ID', async () => {
			vi.mocked(userSessionsRepo.findByUserId).mockReturnValue(
				undefined as any
			);

			const result =
				await userSessionsService.getByUserId('user-unknown');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		const createInput: UserSession.CreateInput = {
			userId: 'user-1',
			accessTokenEncrypted: 'enc-acc',
			refreshTokenEncrypted: 'enc-ref',
			expiresAt: '2026-10-01T00:00:00.000Z'
		};

		it('should throw CONFLICT if an active session already exists for the user', async () => {
			vi.mocked(userSessionsRepo.findByUserId).mockReturnValue(
				mockSession
			);

			await expect(
				userSessionsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message: 'Active session for user [user-1] already exists'
				})
			);

			expect(userSessionsRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return a session if none exists', async () => {
			vi.mocked(userSessionsRepo.findByUserId).mockReturnValue(
				undefined as any
			);
			vi.mocked(userSessionsRepo.create).mockReturnValue(mockSession);

			const result = await userSessionsService.create(createInput);

			expect(userSessionsRepo.create).toHaveBeenCalledWith({
				userId: 'user-1',
				accessTokenEncrypted: 'enc-acc',
				refreshTokenEncrypted: 'enc-ref',
				expiresAt: '2026-10-01T00:00:00.000Z'
			});
			expect(result).toEqual(mockSession);
		});
	});
});
