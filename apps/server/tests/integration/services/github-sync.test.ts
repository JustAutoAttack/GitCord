import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gitHubSyncService } from '../../../src/services/github-sync';
import { githubAppInstallationsService } from '../../../src/services/github-app-installations';
import { githubRepositoriesService } from '../../../src/services/github-repositories';
import { appLogger, ENV } from '../../../src/core';
import { Octokit } from '@octokit/rest';

// Mock Octokit using a proper constructor function to satisfy Vitest/TypeScript
vi.mock('@octokit/rest', () => {
	const mockPaginate = vi.fn();
	return {
		Octokit: vi.fn(function () {
			return {
				paginate: mockPaginate,
				rest: {
					apps: {
						listInstallations: {},
						listReposAccessibleToInstallation: {}
					}
				}
			};
		})
	};
});

vi.mock('@octokit/auth-app', () => ({
	createAppAuth: vi.fn()
}));

// Mock dependent services
vi.mock('../../../src/services/github-app-installations', () => ({
	githubAppInstallationsService: {
		list: vi.fn(),
		delete: vi.fn(),
		getByInstallationId: vi.fn(),
		create: vi.fn()
	}
}));

vi.mock('../../../src/services/github-repositories', () => ({
	githubRepositoriesService: {
		list: vi.fn(),
		delete: vi.fn(),
		create: vi.fn()
	}
}));

// Mock core (appLogger and ENV)
vi.mock('../../../src/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/core')>();
	return {
		...actual,
		ENV: {
			...actual.ENV,
			GITHUB_APP_ID: 'mock-app-id',
			GITHUB_PRIVATE_KEY: 'mock-private-key'
		},
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('GitHubSyncService', () => {
	let mockPaginate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		// Extract and double-cast the paginate mock reference from the constructor implementation
		const octokitInstance = new Octokit({ auth: 'test' });
		mockPaginate = octokitInstance.paginate as unknown as ReturnType<
			typeof vi.fn
		>;
		mockPaginate.mockReset();
	});

	it('should skip sync and log warning if GITHUB_APP_ID or GITHUB_PRIVATE_KEY is missing', async () => {
		const originalAppId = (
			ENV as unknown as { GITHUB_APP_ID?: string | number }
		).GITHUB_APP_ID;

		(ENV as unknown as { GITHUB_APP_ID?: string }).GITHUB_APP_ID =
			undefined;

		await gitHubSyncService.syncInstallations();

		expect(appLogger.warn).toHaveBeenCalledWith(
			'[GitHub Sync] Skipping sync: Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY.'
		);
		expect(mockPaginate).not.toHaveBeenCalled();

		// Restore
		(ENV as unknown as { GITHUB_APP_ID?: string | number }).GITHUB_APP_ID =
			originalAppId;
	});

	it('should clean up stale local installations and repositories, and backfill new ones', async () => {
		const remoteInstallations = [
			{
				id: 123,
				account: { login: 'octocat', type: 'Organization' }
			}
		];

		const remoteRepos = [{ full_name: 'octocat/Hello-World' }];

		// Mocks for local state
		vi.mocked(githubAppInstallationsService.list).mockResolvedValue([
			{
				id: 'local-inst-stale',
				installationId: 999,
				accountLogin: 'old-user',
				accountType: 'User',
				createdAt: '2026-09-01T00:00:00.000Z',
				updatedAt: '2026-09-01T00:00:00.000Z'
			}
		]);

		vi.mocked(
			githubAppInstallationsService.getByInstallationId
		).mockResolvedValue({
			id: 'local-inst-123',
			installationId: 123,
			accountLogin: 'octocat',
			accountType: 'Organization',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});

		vi.mocked(githubRepositoriesService.list).mockResolvedValue([
			{
				id: 'local-repo-stale',
				githubAppInstallationId: 'local-inst-123',
				repositoryUrl: 'https://github.com/octocat/stale-repo',
				repositoryFullName: 'octocat/stale-repo',
				createdAt: '2026-09-01T00:00:00.000Z',
				updatedAt: '2026-09-01T00:00:00.000Z'
			}
		]);

		// Paginate responses for global installations vs installation repositories
		mockPaginate
			.mockResolvedValueOnce(remoteInstallations) // listInstallations
			.mockResolvedValueOnce(remoteRepos); // listReposAccessibleToInstallation

		await gitHubSyncService.syncInstallations();

		// 1. Verify deletion of stale installation
		expect(githubAppInstallationsService.delete).toHaveBeenCalledWith(
			'local-inst-stale'
		);

		// 2. Verify deletion of stale repo
		expect(githubRepositoriesService.delete).toHaveBeenCalledWith(
			'local-repo-stale'
		);

		// 3. Verify backfill of new repo
		expect(githubRepositoriesService.create).toHaveBeenCalledWith({
			githubAppInstallationId: 'local-inst-123',
			repositoryUrl: 'https://github.com/octocat/Hello-World',
			repositoryFullName: 'octocat/Hello-World'
		});

		expect(appLogger.info).toHaveBeenCalledWith(
			'[GitHub Sync] Synchronization completed successfully.'
		);
	});

	it('should create missing installation record if not found locally', async () => {
		const remoteInstallations = [
			{
				id: 456,
				account: { name: 'DevAccount', type: 'User' }
			}
		];

		vi.mocked(githubAppInstallationsService.list).mockResolvedValue([]);
		vi.mocked(
			githubAppInstallationsService.getByInstallationId
		).mockResolvedValue(null);
		vi.mocked(githubAppInstallationsService.create).mockResolvedValue({
			id: 'new-inst-id',
			installationId: 456,
			accountLogin: 'DevAccount',
			accountType: 'User',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});

		vi.mocked(githubRepositoriesService.list).mockResolvedValue([]);

		mockPaginate
			.mockResolvedValueOnce(remoteInstallations)
			.mockResolvedValueOnce([]); // No repos

		await gitHubSyncService.syncInstallations();

		expect(githubAppInstallationsService.create).toHaveBeenCalledWith({
			installationId: 456,
			accountLogin: 'DevAccount',
			accountType: 'User'
		});
		expect(appLogger.info).toHaveBeenCalledWith(
			'[GitHub Sync] Created missing installation record for ID 456'
		);
	});

	it('should catch and log errors if Octokit synchronization fails', async () => {
		mockPaginate.mockRejectedValue(
			new Error('GitHub API Connection Error')
		);

		await gitHubSyncService.syncInstallations();

		expect(appLogger.error).toHaveBeenCalledWith(
			'[GitHub Sync] Failed to synchronize GitHub installations:',
			expect.any(Error)
		);
	});
});
