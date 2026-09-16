import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { guildUserPermissionsService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByGuildAndUserHandler,
	getByIDHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/guild-user-permissions/handlers';
import {
	listRoute,
	getByGuildAndUserRoute,
	getByIDRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/guild-user-permissions/routes';

vi.mock('@services', () => ({
	guildUserPermissionsService: {
		list: vi.fn(),
		getByGuildAndUser: vi.fn(),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../../src/gateway/api/v1/guild-user-permissions/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Guild User Permissions Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByGuildAndUserRoute, getByGuildAndUserHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all guild user permissions without filters', async () => {
			const mockPermissions: any[] = [
				{
					id: 'perm_1',
					guildId: '123456789012345678',
					discordUserId: '987654321098765432',
					commandId: 'cmd_123456'
				}
			];
			vi.mocked(guildUserPermissionsService.list).mockResolvedValue(
				mockPermissions as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockPermissions);
			expect(guildUserPermissionsService.list).toHaveBeenCalledWith(
				undefined
			);
		});

		it('should list guild user permissions filtered by guildId query param', async () => {
			const mockPermissions: any[] = [];
			vi.mocked(guildUserPermissionsService.list).mockResolvedValue(
				mockPermissions as any
			);

			const res = await app.request('/?guildId=123456789012345678');
			expect(res.status).toBe(200);
			expect(guildUserPermissionsService.list).toHaveBeenCalledWith(
				'123456789012345678'
			);
		});
	});

	describe('GET /lookup', () => {
		it('should get guild user permissions by guild and user IDs', async () => {
			const mockPermissions: any[] = [
				{
					id: 'perm_1',
					guildId: '123456789012345678',
					discordUserId: '987654321098765432',
					commandId: 'cmd_123456'
				}
			];
			vi.mocked(
				guildUserPermissionsService.getByGuildAndUser
			).mockResolvedValue(mockPermissions as any);

			const res = await app.request(
				'/lookup?guildId=123456789012345678&discordUserId=987654321098765432'
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockPermissions);
			expect(
				guildUserPermissionsService.getByGuildAndUser
			).toHaveBeenCalledWith('123456789012345678', '987654321098765432');
		});
	});

	describe('GET /{id}', () => {
		it('should get a guild user permission by ID', async () => {
			const mockPermission = {
				id: 'perm_1',
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_123456'
			};
			vi.mocked(guildUserPermissionsService.getById).mockResolvedValue(
				mockPermission as any
			);

			const res = await app.request('/perm_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockPermission);
			expect(guildUserPermissionsService.getById).toHaveBeenCalledWith(
				'perm_1'
			);
		});

		it('should return 404 when guild user permission by ID is not found', async () => {
			vi.mocked(guildUserPermissionsService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/perm_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a guild user permission', async () => {
			const newPayload = {
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_123456'
			};
			const createdPermission = { id: 'perm_1', ...newPayload };
			vi.mocked(guildUserPermissionsService.create).mockResolvedValue(
				createdPermission as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdPermission);
			expect(guildUserPermissionsService.create).toHaveBeenCalledWith(
				newPayload
			);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a guild user permission', async () => {
			const updatePayload = { commandId: 'cmd_999999' };
			const updatedPermission = {
				id: 'perm_1',
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_999999'
			};
			vi.mocked(guildUserPermissionsService.update).mockResolvedValue(
				updatedPermission as any
			);

			const res = await app.request('/perm_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedPermission);
			expect(guildUserPermissionsService.update).toHaveBeenCalledWith(
				'perm_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent guild user permission', async () => {
			vi.mocked(guildUserPermissionsService.update).mockResolvedValue(
				null as any
			);

			const res = await app.request('/perm_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ commandId: 'cmd_123456' })
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a guild user permission', async () => {
			vi.mocked(guildUserPermissionsService.delete).mockResolvedValue(
				true as any
			);

			const res = await app.request('/perm_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Guild user permission deleted successfully'
			});
			expect(guildUserPermissionsService.delete).toHaveBeenCalledWith(
				'perm_1'
			);
		});

		it('should return 404 when deleting a non-existent guild user permission', async () => {
			vi.mocked(guildUserPermissionsService.delete).mockResolvedValue(
				false as any
			);

			const res = await app.request('/perm_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
