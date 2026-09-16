import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { guildRepositoriesService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByGuildAndGithubRepositoryHandler,
	getByIDHandler,
	getByCommandChannelHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/guild-repositories/handlers';
import {
	listRoute,
	getByGuildAndGithubRepositoryRoute,
	getByIDRoute,
	getByCommandChannelRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/guild-repositories/routes';

vi.mock('@services', () => ({
	guildRepositoriesService: {
		list: vi.fn(),
		getByGuildAndGithubRepositoryId: vi.fn(),
		getById: vi.fn(),
		getByCommandChannelId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../../src/gateway/api/v1/guild-repositories/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Guild Repositories Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(
		getByGuildAndGithubRepositoryRoute,
		getByGuildAndGithubRepositoryHandler
	);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByCommandChannelRoute, getByCommandChannelHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all guild repositories without filters', async () => {
			const mockGuildRepos: any[] = [
				{
					id: 'cfg_1',
					guildId: '123456789012345678',
					githubRepositoryId: 'repo_123456',
					commandChannelId: '123456789012345679',
					notificationChannelId: '123456789012345680'
				}
			];
			vi.mocked(guildRepositoriesService.list).mockResolvedValue(
				mockGuildRepos as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockGuildRepos);
			expect(guildRepositoriesService.list).toHaveBeenCalledWith(
				undefined,
				undefined
			);
		});

		it('should list guild repositories filtered by query parameters', async () => {
			const mockGuildRepos: any[] = [];
			vi.mocked(guildRepositoriesService.list).mockResolvedValue(
				mockGuildRepos as any
			);

			const res = await app.request(
				'/?guildId=123456789012345678&githubRepositoryId=repo_123456'
			);
			expect(res.status).toBe(200);
			expect(guildRepositoriesService.list).toHaveBeenCalledWith(
				'123456789012345678',
				'repo_123456'
			);
		});
	});

	describe('GET /lookup', () => {
		it('should get a guild repository by guild and GitHub repository IDs', async () => {
			const mockGuildRepo = {
				id: 'cfg_1',
				guildId: '123456789012345678',
				githubRepositoryId: 'repo_123456',
				commandChannelId: '123456789012345679',
				notificationChannelId: '123456789012345680'
			};
			vi.mocked(
				guildRepositoriesService.getByGuildAndGithubRepositoryId
			).mockResolvedValue(mockGuildRepo as any);

			const res = await app.request(
				'/lookup?guildId=123456789012345678&githubRepositoryId=repo_123456'
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockGuildRepo);
			expect(
				guildRepositoriesService.getByGuildAndGithubRepositoryId
			).toHaveBeenCalledWith('123456789012345678', 'repo_123456');
		});

		it('should return 404 when guild repository by lookup is not found', async () => {
			vi.mocked(
				guildRepositoriesService.getByGuildAndGithubRepositoryId
			).mockResolvedValue(null as any);

			const res = await app.request(
				'/lookup?guildId=000000000000000000&githubRepositoryId=repo_999999'
			);
			expect(res.status).toBe(404);
		});
	});

	describe('GET /{id}', () => {
		it('should get a guild repository by ID', async () => {
			const mockGuildRepo = {
				id: 'cfg_1',
				guildId: '123456789012345678',
				githubRepositoryId: 'repo_123456',
				commandChannelId: '123456789012345679',
				notificationChannelId: '123456789012345680'
			};
			vi.mocked(guildRepositoriesService.getById).mockResolvedValue(
				mockGuildRepo as any
			);

			const res = await app.request('/cfg_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockGuildRepo);
			expect(guildRepositoriesService.getById).toHaveBeenCalledWith(
				'cfg_1'
			);
		});

		it('should return 404 when guild repository by ID is not found', async () => {
			vi.mocked(guildRepositoriesService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/cfg_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /command-channel/{commandChannelId}', () => {
		it('should get a guild repository by command channel ID', async () => {
			const mockGuildRepo = {
				id: 'cfg_1',
				guildId: '123456789012345678',
				githubRepositoryId: 'repo_123456',
				commandChannelId: '123456789012345679',
				notificationChannelId: '123456789012345680'
			};
			vi.mocked(
				guildRepositoriesService.getByCommandChannelId
			).mockResolvedValue(mockGuildRepo as any);

			const res = await app.request(
				'/command-channel/123456789012345679'
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockGuildRepo);
			expect(
				guildRepositoriesService.getByCommandChannelId
			).toHaveBeenCalledWith('123456789012345679');
		});

		it('should return 404 when guild repository by command channel ID is not found', async () => {
			vi.mocked(
				guildRepositoriesService.getByCommandChannelId
			).mockResolvedValue(null as any);

			const res = await app.request(
				'/command-channel/000000000000000000'
			);
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a guild repository', async () => {
			const newPayload = {
				guildId: '123456789012345678',
				githubRepositoryId: 'repo_123456',
				commandChannelId: '123456789012345679',
				notificationChannelId: '123456789012345680'
			};
			const createdGuildRepo = { id: 'cfg_1', ...newPayload };
			vi.mocked(guildRepositoriesService.create).mockResolvedValue(
				createdGuildRepo as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdGuildRepo);
			expect(guildRepositoriesService.create).toHaveBeenCalledWith(
				newPayload
			);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a guild repository', async () => {
			const updatePayload = {
				notificationChannelId: '999999999999999999'
			};
			const updatedGuildRepo = {
				id: 'cfg_1',
				guildId: '123456789012345678',
				githubRepositoryId: 'repo_123456',
				commandChannelId: '123456789012345679',
				notificationChannelId: '999999999999999999'
			};
			vi.mocked(guildRepositoriesService.update).mockResolvedValue(
				updatedGuildRepo as any
			);

			const res = await app.request('/cfg_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedGuildRepo);
			expect(guildRepositoriesService.update).toHaveBeenCalledWith(
				'cfg_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent guild repository', async () => {
			vi.mocked(guildRepositoriesService.update).mockResolvedValue(
				null as any
			);

			const res = await app.request('/cfg_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					notificationChannelId: '123456789012345680'
				})
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a guild repository', async () => {
			vi.mocked(guildRepositoriesService.delete).mockResolvedValue(
				true as any
			);

			const res = await app.request('/cfg_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Guild repository deleted successfully'
			});
			expect(guildRepositoriesService.delete).toHaveBeenCalledWith(
				'cfg_1'
			);
		});

		it('should return 404 when deleting a non-existent guild repository', async () => {
			vi.mocked(guildRepositoriesService.delete).mockResolvedValue(
				false as any
			);

			const res = await app.request('/cfg_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
