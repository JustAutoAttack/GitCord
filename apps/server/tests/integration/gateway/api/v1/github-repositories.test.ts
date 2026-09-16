import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { githubRepositoriesService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByUrlHandler,
	getByIDHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/github-repositories/handlers';
import {
	listRoute,
	getByUrlRoute,
	getByIDRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/github-repositories/routes';

vi.mock('@services', () => ({
	githubRepositoriesService: {
		list: vi.fn(),
		getByRepositoryUrl: vi.fn(),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../../src/gateway/api/v1/github-repositories/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('GitHub Repositories Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByUrlRoute, getByUrlHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all GitHub repositories without filter', async () => {
			const mockRepos = [
				{
					id: 'repo_1',
					githubAppInstallationId: '12345678',
					repositoryUrl:
						'https://github.com/gitcord-org/core-service',
					repositoryFullName: 'gitcord-org/core-service'
				}
			];
			vi.mocked(githubRepositoriesService.list).mockResolvedValue(
				mockRepos as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockRepos);
			expect(githubRepositoriesService.list).toHaveBeenCalledWith(
				undefined
			);
		});

		it('should list GitHub repositories filtered by installation ID query param', async () => {
			const mockRepos: any[] = [
				{
					id: 'repo_1',
					githubAppInstallationId: '12345678',
					repositoryUrl:
						'https://github.com/gitcord-org/core-service',
					repositoryFullName: 'gitcord-org/core-service'
				}
			];
			vi.mocked(githubRepositoriesService.list).mockResolvedValue(
				mockRepos as any
			);

			const res = await app.request('/?githubAppInstallationId=12345678');
			expect(res.status).toBe(200);
			expect(githubRepositoriesService.list).toHaveBeenCalledWith(
				'12345678'
			);
		});
	});

	describe('GET /lookup', () => {
		it('should get a GitHub repository by URL', async () => {
			const mockRepo = {
				id: 'repo_1',
				githubAppInstallationId: '12345678',
				repositoryUrl: 'https://github.com/gitcord-org/core-service',
				repositoryFullName: 'gitcord-org/core-service'
			};
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue(mockRepo as any);

			const encodedUrl = encodeURIComponent(
				'https://github.com/gitcord-org/core-service'
			);
			const res = await app.request(
				`/lookup?repositoryUrl=${encodedUrl}`
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockRepo);
			expect(
				githubRepositoriesService.getByRepositoryUrl
			).toHaveBeenCalledWith(
				'https://github.com/gitcord-org/core-service'
			);
		});

		it('should return 404 when GitHub repository by URL is not found', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue(null as any);

			const encodedUrl = encodeURIComponent(
				'https://github.com/gitcord-org/nonexistent'
			);
			const res = await app.request(
				`/lookup?repositoryUrl=${encodedUrl}`
			);
			expect(res.status).toBe(404);
		});
	});

	describe('GET /{id}', () => {
		it('should get a GitHub repository by ID', async () => {
			const mockRepo = {
				id: 'repo_1',
				githubAppInstallationId: '12345678',
				repositoryUrl: 'https://github.com/gitcord-org/core-service',
				repositoryFullName: 'gitcord-org/core-service'
			};
			vi.mocked(githubRepositoriesService.getById).mockResolvedValue(
				mockRepo as any
			);

			const res = await app.request('/repo_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockRepo);
			expect(githubRepositoriesService.getById).toHaveBeenCalledWith(
				'repo_1'
			);
		});

		it('should return 404 when GitHub repository by ID is not found', async () => {
			vi.mocked(githubRepositoriesService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/repo_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a GitHub repository', async () => {
			const newPayload = {
				githubAppInstallationId: '12345678',
				repositoryUrl: 'https://github.com/gitcord-org/core-service',
				repositoryFullName: 'gitcord-org/core-service'
			};
			const createdRepo = { id: 'repo_1', ...newPayload };
			vi.mocked(githubRepositoriesService.create).mockResolvedValue(
				createdRepo as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdRepo);
			expect(githubRepositoriesService.create).toHaveBeenCalledWith(
				newPayload
			);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a GitHub repository', async () => {
			const updatePayload = {
				repositoryFullName: 'gitcord-org/updated-service'
			};
			const updatedRepo = {
				id: 'repo_1',
				githubAppInstallationId: '12345678',
				repositoryUrl: 'https://github.com/gitcord-org/core-service',
				repositoryFullName: 'gitcord-org/updated-service'
			};
			vi.mocked(githubRepositoriesService.update).mockResolvedValue(
				updatedRepo as any
			);

			const res = await app.request('/repo_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedRepo);
			expect(githubRepositoriesService.update).toHaveBeenCalledWith(
				'repo_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent GitHub repository', async () => {
			vi.mocked(githubRepositoriesService.update).mockResolvedValue(
				null as any
			);

			const res = await app.request('/repo_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ repositoryFullName: 'test/test' })
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a GitHub repository', async () => {
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				true as any
			);

			const res = await app.request('/repo_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'GitHub repository deleted successfully'
			});
			expect(githubRepositoriesService.delete).toHaveBeenCalledWith(
				'repo_1'
			);
		});

		it('should return 404 when deleting a non-existent GitHub repository', async () => {
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				false as any
			);

			const res = await app.request('/repo_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
