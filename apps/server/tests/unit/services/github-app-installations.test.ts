import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GithubAppInstallation } from '@domain';
import { githubAppInstallationsService } from '../../../src/services';
import { githubAppInstallationsRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		githubAppInstallationsRepo: {
			findByInstallationId: vi.fn(),
			create: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findMany: vi.fn()
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

describe('GithubAppInstallationsService', () => {
	const mockInstallation: GithubAppInstallation.Model = {
		id: 'inst-id-1',
		installationId: 123456,
		accountLogin: 'test-org',
		accountType: 'Organization',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getByInstallationId', () => {
		it('should return the installation when it exists', async () => {
			vi.mocked(
				githubAppInstallationsRepo.findByInstallationId
			).mockReturnValue(mockInstallation);

			const result =
				await githubAppInstallationsService.getByInstallationId(123456);

			expect(
				githubAppInstallationsRepo.findByInstallationId
			).toHaveBeenCalledWith(123456);
			expect(result).toEqual(mockInstallation);
		});

		it('should return null when the installation does not exist', async () => {
			vi.mocked(
				githubAppInstallationsRepo.findByInstallationId
			).mockReturnValue(undefined as any);

			const result =
				await githubAppInstallationsService.getByInstallationId(999999);

			expect(
				githubAppInstallationsRepo.findByInstallationId
			).toHaveBeenCalledWith(999999);
			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		const createInput: GithubAppInstallation.CreateInput = {
			installationId: 123456,
			accountLogin: 'test-org',
			accountType: 'Organization'
		};

		it('should throw an AppError with CONFLICT if an installation with the same ID already exists', async () => {
			vi.mocked(
				githubAppInstallationsRepo.findByInstallationId
			).mockReturnValue(mockInstallation);

			await expect(
				githubAppInstallationsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message: 'GitHub app installation [123456] already exists'
				})
			);

			expect(githubAppInstallationsRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return the installation if it does not exist', async () => {
			vi.mocked(
				githubAppInstallationsRepo.findByInstallationId
			).mockReturnValue(null as any);
			vi.mocked(githubAppInstallationsRepo.create).mockReturnValue(
				mockInstallation
			);

			const result =
				await githubAppInstallationsService.create(createInput);

			expect(
				githubAppInstallationsRepo.findByInstallationId
			).toHaveBeenCalledWith(123456);
			expect(githubAppInstallationsRepo.create).toHaveBeenCalledWith({
				installationId: 123456,
				accountLogin: 'test-org',
				accountType: 'Organization'
			});
			expect(result).toEqual(mockInstallation);
		});
	});
});
