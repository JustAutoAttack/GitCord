import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { usersService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByIDHandler,
	getByDiscordIDHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/users/handlers';
import {
	listRoute,
	getByIDRoute,
	getByDiscordIDRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/users/routes';

vi.mock('@services', () => ({
	usersService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByDiscordId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../../src/gateway/api/v1/users/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Users Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByDiscordIDRoute, getByDiscordIDHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all users', async () => {
			const mockUsers: any[] = [
				{
					id: 'usr_1',
					discordId: '123456789012345678',
					displayName: 'JohnDoe',
					avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
				}
			];
			vi.mocked(usersService.list).mockResolvedValue(mockUsers as any);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUsers);
			expect(usersService.list).toHaveBeenCalled();
		});
	});

	describe('GET /{id}', () => {
		it('should get a user by ID', async () => {
			const mockUser = {
				id: 'usr_1',
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
			};
			vi.mocked(usersService.getById).mockResolvedValue(mockUser as any);

			const res = await app.request('/usr_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUser);
			expect(usersService.getById).toHaveBeenCalledWith('usr_1');
		});

		it('should return 404 when user by ID is not found', async () => {
			vi.mocked(usersService.getById).mockResolvedValue(null as any);

			const res = await app.request('/usr_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /discord/{discordId}', () => {
		it('should get a user by Discord ID', async () => {
			const mockUser = {
				id: 'usr_1',
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
			};
			vi.mocked(usersService.getByDiscordId).mockResolvedValue(
				mockUser as any
			);

			const res = await app.request('/discord/123456789012345678');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUser);
			expect(usersService.getByDiscordId).toHaveBeenCalledWith(
				'123456789012345678'
			);
		});

		it('should return 404 when user by Discord ID is not found', async () => {
			vi.mocked(usersService.getByDiscordId).mockResolvedValue(
				null as any
			);

			const res = await app.request('/discord/000000000000000000');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a user', async () => {
			const newPayload = {
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
			};
			const createdUser = { id: 'usr_1', ...newPayload };
			vi.mocked(usersService.create).mockResolvedValue(
				createdUser as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdUser);
			expect(usersService.create).toHaveBeenCalledWith(newPayload);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a user', async () => {
			const updatePayload = { displayName: 'JohnDoeUpdated' };
			const updatedUser = {
				id: 'usr_1',
				discordId: '123456789012345678',
				displayName: 'JohnDoeUpdated',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
			};
			vi.mocked(usersService.update).mockResolvedValue(
				updatedUser as any
			);

			const res = await app.request('/usr_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedUser);
			expect(usersService.update).toHaveBeenCalledWith(
				'usr_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent user', async () => {
			vi.mocked(usersService.update).mockResolvedValue(null as any);

			const res = await app.request('/usr_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ displayName: 'JohnDoe' })
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a user', async () => {
			vi.mocked(usersService.delete).mockResolvedValue(true as any);

			const res = await app.request('/usr_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'User deleted successfully'
			});
			expect(usersService.delete).toHaveBeenCalledWith('usr_1');
		});

		it('should return 404 when deleting a non-existent user', async () => {
			vi.mocked(usersService.delete).mockResolvedValue(false as any);

			const res = await app.request('/usr_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
