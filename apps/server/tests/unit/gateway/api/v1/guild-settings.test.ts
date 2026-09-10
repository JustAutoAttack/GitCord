import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { guildSettingsRouter } from '@gateway/api/v1/guild-settings';
import { guildSettingsService } from '@services';

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

const app = new OpenAPIHono({
	defaultHook: (result, c) => {
		if (!result.success) {
			return c.json(
				{
					success: false,
					message: 'Validation failed',
					errors: result.error.flatten()
				},
				400
			);
		}
		return;
	}
});

app.onError((error, c) => {
	if (error instanceof AppError) {
		return c.json(
			{
				success: false,
				message: error.message,
				code: error.code
			},
			error.statusCode as any
		);
	}

	const message =
		error instanceof Error ? error.message : 'Internal Server Error';
	return c.json(
		{
			success: false,
			message
		},
		500
	);
});

app.route('/', guildSettingsRouter);

describe('Guild Settings API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- GET / (List) ---
	describe('GET /', () => {
		it('returns 200 and a list of guild settings', async () => {
			const mockSettings = [
				{
					id: 'set_123456',
					guildId: '123456789012345678',
					systemChannelId: '123456789012345679',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(guildSettingsService.list).mockResolvedValueOnce(
				mockSettings
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSettings);
			expect(guildSettingsService.list).toHaveBeenCalledOnce();
		});
	});

	// --- GET /:id (Get by ID) ---
	describe('GET /:id', () => {
		it('returns 200 and the guild setting when found', async () => {
			const mockSetting = {
				id: 'set_123456',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildSettingsService.getById).mockResolvedValueOnce(
				mockSetting
			);

			const res = await app.request('/set_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(guildSettingsService.getById).toHaveBeenCalledWith(
				'set_123456'
			);
		});

		it('returns 404 when guild setting is not found', async () => {
			vi.mocked(guildSettingsService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('Guild setting not found');
		});
	});

	// --- GET /guild/:guildId ---
	describe('GET /guild/:guildId', () => {
		it('returns 200 and the guild setting when found by guild ID', async () => {
			const mockSetting = {
				id: 'set_123456',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildSettingsService.getByGuildId).mockResolvedValueOnce(
				mockSetting
			);

			const res = await app.request('/guild/123456789012345678');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(guildSettingsService.getByGuildId).toHaveBeenCalledWith(
				'123456789012345678'
			);
		});

		it('returns 404 when guild setting is not found by guild ID', async () => {
			vi.mocked(guildSettingsService.getByGuildId).mockResolvedValueOnce(
				null
			);

			const res = await app.request('/guild/missing');

			expect(res.status).toBe(404);
		});
	});

	// --- GET /system-channel/:systemChannelId ---
	describe('GET /system-channel/:systemChannelId', () => {
		it('returns 200 and the guild setting when found by system channel ID', async () => {
			const mockSetting = {
				id: 'set_123456',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(
				guildSettingsService.getBySystemChannelId
			).mockResolvedValueOnce(mockSetting);

			const res = await app.request('/system-channel/123456789012345679');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSetting);
			expect(
				guildSettingsService.getBySystemChannelId
			).toHaveBeenCalledWith('123456789012345679');
		});

		it('returns 404 when guild setting is not found by system channel ID', async () => {
			vi.mocked(
				guildSettingsService.getBySystemChannelId
			).mockResolvedValueOnce(null);

			const res = await app.request('/system-channel/missing');

			expect(res.status).toBe(404);
		});
	});

	// --- POST / (Create) ---
	describe('POST /', () => {
		it('returns 201 and the created guild setting when payload is valid', async () => {
			const input = {
				guildId: '123456789012345678',
				systemChannelId: '123456789012345679'
			};
			const created = {
				id: 'set_123456',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildSettingsService.create).mockResolvedValueOnce(
				created
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(created);
			expect(guildSettingsService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guildId: '' })
			});

			expect(res.status).toBe(400);
			expect(guildSettingsService.create).not.toHaveBeenCalled();
		});
	});

	// --- PATCH /:id (Update) ---
	describe('PATCH /:id', () => {
		it('returns 200 and the updated guild setting when valid', async () => {
			const input = { systemChannelId: '123456789012345699' };
			const updated = {
				id: 'set_123456',
				guildId: '123456789012345678',
				systemChannelId: '123456789012345699',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildSettingsService.update).mockResolvedValueOnce(
				updated
			);

			const res = await app.request('/set_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(guildSettingsService.update).toHaveBeenCalledWith(
				'set_123456',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service throws NOT_FOUND error on update', async () => {
			vi.mocked(guildSettingsService.update).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Guild setting [ID: missing] not found for update'
				)
			);

			const res = await app.request('/missing', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ systemChannelId: '123456789012345699' })
			});

			expect(res.status).toBe(404);
		});
	});

	// --- DELETE /:id (Delete) ---
	describe('DELETE /:id', () => {
		it('returns 200 and success message when guild setting is deleted', async () => {
			vi.mocked(guildSettingsService.delete).mockResolvedValueOnce(true);

			const res = await app.request('/set_123456', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Guild setting deleted successfully'
			});
			expect(guildSettingsService.delete).toHaveBeenCalledWith(
				'set_123456'
			);
		});

		it('returns 404 when service throws NOT_FOUND error during deletion', async () => {
			vi.mocked(guildSettingsService.delete).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Guild setting [ID: missing] not found for deletion'
				)
			);

			const res = await app.request('/missing', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
