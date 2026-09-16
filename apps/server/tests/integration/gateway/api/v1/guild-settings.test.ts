import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { guildSettingsService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByIDHandler,
	getByGuildHandler,
	getBySystemChannelHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/guild-settings/handlers';
import {
	listRoute,
	getByIDRoute,
	getByGuildRoute,
	getBySystemChannelRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/guild-settings/routes';

vi.mock('@services', () => ({
	guildSettingsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByGuildId: vi.fn(),
		getBySystemChannelId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../../src/gateway/api/v1/guild-settings/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Guild Settings Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByGuildRoute, getByGuildHandler);
	app.openapi(getBySystemChannelRoute, getBySystemChannelHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all guild settings without filters', async () => {
			const mockSettings: any[] = [
				{
					id: 'set_1',
					guildId: '123456789012345678',
					systemChannelId: '123456789012345679',
					notifyOnConnection: true
				}
			];
			vi.mocked(guildSettingsService.list).mockResolvedValue(
				mockSettings as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSettings);
			expect(guildSettingsService.list).toHaveBeenCalledWith(undefined);
		});

		it('should list guild settings filtered by notifyOnConnection query param set to false', async () => {
			const mockSettings: any[] = [];
			vi.mocked(guildSettingsService.list).mockResolvedValue(
				mockSettings as any
			);

			const res = await app.request('/?notifyOnConnection=false');
			expect(res.status).toBe(200);
			expect(guildSettingsService.list).toHaveBeenCalledWith(false);
		});
        
		it('should list guild settings filtered by notifyOnConnection query param set to true or 1', async () => {
			const mockSettings: any[] = [];
			vi.mocked(guildSettingsService.list).mockResolvedValue(
				mockSettings as any
			);

			const resTrue = await app.request('/?notifyOnConnection=true');
			expect(resTrue.status).toBe(200);
			expect(guildSettingsService.list).toHaveBeenCalledWith(true);

			const resOne = await app.request('/?notifyOnConnection=1');
			expect(resOne.status).toBe(200);
			expect(guildSettingsService.list).toHaveBeenCalledWith(true);
		});
	});

	describe('GET /{id}', () => {
		it('should get a guild setting by ID', async () => {
			const mockSetting = {
				id: 'set_1',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				notifyOnConnection: true
			};
			vi.mocked(guildSettingsService.getById).mockResolvedValue(
				mockSetting as any
			);

			const res = await app.request('/set_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(guildSettingsService.getById).toHaveBeenCalledWith('set_1');
		});

		it('should return 404 when guild setting by ID is not found', async () => {
			vi.mocked(guildSettingsService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/set_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /guild/{guildId}', () => {
		it('should get a guild setting by guild ID', async () => {
			const mockSetting = {
				id: 'set_1',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				notifyOnConnection: true
			};
			vi.mocked(guildSettingsService.getByGuildId).mockResolvedValue(
				mockSetting as any
			);

			const res = await app.request('/guild/123456789012345678');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(guildSettingsService.getByGuildId).toHaveBeenCalledWith(
				'123456789012345678'
			);
		});

		it('should return 404 when guild setting by guild ID is not found', async () => {
			vi.mocked(guildSettingsService.getByGuildId).mockResolvedValue(
				null as any
			);

			const res = await app.request('/guild/000000000000000000');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /system-channel/{systemChannelId}', () => {
		it('should get a guild setting by system channel ID', async () => {
			const mockSetting = {
				id: 'set_1',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				notifyOnConnection: true
			};
			vi.mocked(
				guildSettingsService.getBySystemChannelId
			).mockResolvedValue(mockSetting as any);

			const res = await app.request('/system-channel/123456789012345679');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(
				guildSettingsService.getBySystemChannelId
			).toHaveBeenCalledWith('123456789012345679');
		});

		it('should return 404 when guild setting by system channel ID is not found', async () => {
			vi.mocked(
				guildSettingsService.getBySystemChannelId
			).mockResolvedValue(null as any);

			const res = await app.request('/system-channel/000000000000000000');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a guild setting', async () => {
			const newPayload = {
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				notifyOnConnection: true
			};
			const createdSetting = { id: 'set_1', ...newPayload };
			vi.mocked(guildSettingsService.create).mockResolvedValue(
				createdSetting as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdSetting);
			expect(guildSettingsService.create).toHaveBeenCalledWith(
				newPayload
			);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a guild setting', async () => {
			const updatePayload = { notifyOnConnection: false };
			const updatedSetting = {
				id: 'set_1',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				notifyOnConnection: false
			};
			vi.mocked(guildSettingsService.update).mockResolvedValue(
				updatedSetting as any
			);

			const res = await app.request('/set_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedSetting);
			expect(guildSettingsService.update).toHaveBeenCalledWith(
				'set_1',
				updatePayload
			);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a guild setting', async () => {
			vi.mocked(guildSettingsService.delete).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/set_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Guild setting deleted successfully'
			});
			expect(guildSettingsService.delete).toHaveBeenCalledWith('set_1');
		});
	});
});
