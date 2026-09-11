import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { remoteConfigsRouter } from '@gateway/api/v1/remote-configs';
import { remoteConfigsService } from '@services';

vi.mock('@services', () => ({
	remoteConfigsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByCommandChannelId: vi.fn(),
		getByGuildAndRepo: vi.fn(),
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

app.route('/', remoteConfigsRouter);

describe('Remote Configs API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- GET / (List) ---
	describe('GET /', () => {
		it('returns 200 and a list of remote configurations', async () => {
			const mockConfigs = [
				{
					id: '123e4567-e89b-12d3-a456-426614174000',
					guildId: 'guild_1',
					repositoryUrl: 'https://github.com/owner/repo',
					commandChannelId: 'chan_1',
					notificationChannelId: 'chan_notif_1',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-01T10:00:00.000Z'
				}
			];
			vi.mocked(remoteConfigsService.list).mockResolvedValueOnce(
				mockConfigs
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfigs);
			expect(remoteConfigsService.list).toHaveBeenCalledOnce();
		});
	});

	// --- GET /lookup (Get by Guild and Repo) ---
	describe('GET /lookup', () => {
		it('returns 200 and configuration when found by guild and repo', async () => {
			const mockConfig = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-01T10:00:00.000Z'
			};
			vi.mocked(
				remoteConfigsService.getByGuildAndRepo
			).mockResolvedValueOnce(mockConfig);

			const res = await app.request(
				'/lookup?guildId=guild_1&repositoryUrl=https://github.com/owner/repo'
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfig);
			expect(remoteConfigsService.getByGuildAndRepo).toHaveBeenCalledWith(
				'guild_1',
				'https://github.com/owner/repo'
			);
		});

		it('returns 404 when configuration is not found by guild and repo', async () => {
			vi.mocked(
				remoteConfigsService.getByGuildAndRepo
			).mockResolvedValueOnce(null);

			const res = await app.request(
				'/lookup?guildId=guild_1&repositoryUrl=https://github.com/owner/repo'
			);

			expect(res.status).toBe(404);
		});
	});

	// --- GET /:id (Get by ID) ---
	describe('GET /:id', () => {
		it('returns 200 and the configuration when found', async () => {
			const mockConfig = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-01T10:00:00.000Z'
			};
			vi.mocked(remoteConfigsService.getById).mockResolvedValueOnce(
				mockConfig
			);

			const res = await app.request(
				'/123e4567-e89b-12d3-a456-426614174000'
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfig);
			expect(remoteConfigsService.getById).toHaveBeenCalledWith(
				'123e4567-e89b-12d3-a456-426614174000'
			);
		});

		it('returns 404 when configuration is not found', async () => {
			vi.mocked(remoteConfigsService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('Remote configuration not found');
		});
	});

	// --- GET /command-channel/:commandChannelId ---
	describe('GET /command-channel/:commandChannelId', () => {
		it('returns 200 and the configuration when found by command channel', async () => {
			const mockConfig = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-01T10:00:00.000Z'
			};
			vi.mocked(
				remoteConfigsService.getByCommandChannelId
			).mockResolvedValueOnce(mockConfig);

			const res = await app.request('/command-channel/chan_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfig);
			expect(
				remoteConfigsService.getByCommandChannelId
			).toHaveBeenCalledWith('chan_1');
		});

		it('returns 404 when configuration is not found by command channel', async () => {
			vi.mocked(
				remoteConfigsService.getByCommandChannelId
			).mockResolvedValueOnce(null);

			const res = await app.request('/command-channel/missing');

			expect(res.status).toBe(404);
		});
	});

	// --- POST / (Create) ---
	describe('POST /', () => {
		it('returns 201 and the created configuration when payload is valid', async () => {
			const input = {
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1'
			};
			const created = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-01T10:00:00.000Z'
			};
			vi.mocked(remoteConfigsService.create).mockResolvedValueOnce(
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
			expect(remoteConfigsService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guildId: '' })
			});

			expect(res.status).toBe(400);
			expect(remoteConfigsService.create).not.toHaveBeenCalled();
		});
	});

	// --- PATCH /:id (Update) ---
	describe('PATCH /:id', () => {
		it('returns 200 and the updated configuration when valid', async () => {
			const input = { commandChannelId: 'chan_updated' };
			const updated = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_updated',
				notificationChannelId: 'chan_notif_1',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-01T10:00:00.000Z'
			};
			vi.mocked(remoteConfigsService.update).mockResolvedValueOnce(
				updated
			);

			const res = await app.request(
				'/123e4567-e89b-12d3-a456-426614174000',
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(input)
				}
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(remoteConfigsService.update).toHaveBeenCalledWith(
				'123e4567-e89b-12d3-a456-426614174000',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service throws NOT_FOUND error', async () => {
			vi.mocked(remoteConfigsService.update).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Remote configuration not found for update'
				)
			);

			const res = await app.request('/missing', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandChannelId: 'chan_updated' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 404 when service returns null on update', async () => {
			vi.mocked(remoteConfigsService.update).mockResolvedValueOnce(
				null as any
			);

			const res = await app.request(
				'/123e4567-e89b-12d3-a456-426614174000',
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ commandChannelId: 'chan_updated' })
				}
			);

			expect(res.status).toBe(404);
		});
	});

	// --- DELETE /:id (Delete) ---
	describe('DELETE /:id', () => {
		it('returns 200 and success message when configuration is deleted', async () => {
			vi.mocked(remoteConfigsService.delete).mockResolvedValueOnce(true);

			const res = await app.request(
				'/123e4567-e89b-12d3-a456-426614174000',
				{
					method: 'DELETE'
				}
			);
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Remote configuration deleted successfully'
			});
			expect(remoteConfigsService.delete).toHaveBeenCalledWith(
				'123e4567-e89b-12d3-a456-426614174000'
			);
		});

		it('returns 404 when service throws NOT_FOUND error during deletion', async () => {
			vi.mocked(remoteConfigsService.delete).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Remote configuration not found for deletion'
				)
			);

			const res = await app.request('/missing', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});

		it('returns 404 when service returns falsy on deletion', async () => {
			vi.mocked(remoteConfigsService.delete).mockResolvedValueOnce(false);

			const res = await app.request(
				'/123e4567-e89b-12d3-a456-426614174000',
				{
					method: 'DELETE'
				}
			);

			expect(res.status).toBe(404);
		});
	});

	it('returns 400 when query params fail validation on lookup', async () => {
		const res = await app.request('/lookup?guildId=');
		expect(res.status).toBe(400);
		expect(remoteConfigsService.getByGuildAndRepo).not.toHaveBeenCalled();
	});

	it('returns 400 when payload fails Zod schema validation on update', async () => {
		const res = await app.request('/123e4567-e89b-12d3-a456-426614174000', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ repositoryUrl: 'not-a-url' })
		});

		expect(res.status).toBe(400);
		expect(remoteConfigsService.update).not.toHaveBeenCalled();
	});

	it('returns 500 when an unexpected non-AppError occurs', async () => {
		vi.mocked(remoteConfigsService.list).mockRejectedValueOnce(
			new Error('Database connection lost')
		);

		const res = await app.request('/');
		const body = (await res.json()) as any;

		expect(res.status).toBe(500);
		expect(body.message).toBe('Database connection lost');
	});
});
