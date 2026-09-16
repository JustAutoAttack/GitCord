import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GithubRepository } from '@domain';
import { githubRepositoriesService } from '../../../src/services';
import { githubRepositoriesRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		githubRepositoriesRepo: {
			findAll: vi.fn(),
			findByGithubAppInstallationId: vi.fn(),
			findByRepositoryUrl: vi.fn(),
			create: vi.fn(),
			findById: vi.fn(),
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

describe('GithubRepositoriesService', () => {
	const mockRepo: GithubRepository.Model = {
		id: 'repo-id-1',
		githubAppInstallationId: 'inst-1',
		repositoryUrl: 'https://github.com/owner/test-repo',
		repositoryFullName: 'owner/test-repo',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('list', () => {
		it('should return repositories filtered by installation ID when provided', async () => {
			vi.mocked(
				githubRepositoriesRepo.findByGithubAppInstallationId
			).mockReturnValue([mockRepo]);

			const result = await githubRepositoriesService.list('inst-1');

			expect(
				githubRepositoriesRepo.findByGithubAppInstallationId
			).toHaveBeenCalledWith('inst-1');
			expect(githubRepositoriesRepo.findAll).not.toHaveBeenCalled();
			expect(result).toEqual([mockRepo]);
		});

		it('should return all repositories when installation ID is not provided', async () => {
			vi.mocked(githubRepositoriesRepo.findAll).mockReturnValue([
				mockRepo
			]);

			const result = await githubRepositoriesService.list();

			expect(githubRepositoriesRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual([mockRepo]);
		});
	});

	describe('getByRepositoryUrl', () => {
		it('should return the repository when found by URL', async () => {
			vi.mocked(
				githubRepositoriesRepo.findByRepositoryUrl
			).mockReturnValue(mockRepo);

			const result = await githubRepositoriesService.getByRepositoryUrl(
				'https://github.com/owner/test-repo'
			);

			expect(
				githubRepositoriesRepo.findByRepositoryUrl
			).toHaveBeenCalledWith('https://github.com/owner/test-repo');
			expect(result).toEqual(mockRepo);
		});

		it('should return null when no repository is found by URL', async () => {
			vi.mocked(
				githubRepositoriesRepo.findByRepositoryUrl
			).mockReturnValue(undefined as any);

			const result = await githubRepositoriesService.getByRepositoryUrl(
				'https://github.com/owner/unknown'
			);

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		const createInput: GithubRepository.CreateInput = {
			githubAppInstallationId: 'inst-1',
			repositoryUrl: 'https://github.com/owner/test-repo',
			repositoryFullName: 'owner/test-repo'
		};

		it('should throw an AppError with CONFLICT if the repository URL already exists', async () => {
			vi.mocked(
				githubRepositoriesRepo.findByRepositoryUrl
			).mockReturnValue(mockRepo);

			await expect(
				githubRepositoriesService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message:
						'GitHub repository [https://github.com/owner/test-repo] already exists.'
				})
			);

			expect(githubRepositoriesRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return the repository if it does not exist', async () => {
			vi.mocked(
				githubRepositoriesRepo.findByRepositoryUrl
			).mockReturnValue(null as any);
			vi.mocked(githubRepositoriesRepo.create).mockReturnValue(mockRepo);

			const result = await githubRepositoriesService.create(createInput);

			expect(
				githubRepositoriesRepo.findByRepositoryUrl
			).toHaveBeenCalledWith('https://github.com/owner/test-repo');
			expect(githubRepositoriesRepo.create).toHaveBeenCalledWith({
				githubAppInstallationId: 'inst-1',
				repositoryUrl: 'https://github.com/owner/test-repo',
				repositoryFullName: 'owner/test-repo'
			});
			expect(result).toEqual(mockRepo);
		});
	});
});
