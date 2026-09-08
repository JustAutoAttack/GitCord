import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError } from '@core';
import { repoConfigsRouter } from '@gateway/api/v1/repo-configs';
import { repoConfigsService } from '@services';

vi.mock('@services', () => ({
	repoConfigsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByCommandChannelId: vi.fn(),
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

app.route('/', repoConfigsRouter);

describe('Repo Configs API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- GET / (List) ---
	describe('GET /', () => {
		it('returns 200 and a list of repository configurations', async () => {
			const mockConfigs = [
				{
					id: 'cfg_1',
					guildId: 'guild_1',
					repositoryUrl: 'https://github.com/owner/repo',
					commandChannelId: 'chan_1',
					notificationChannelId: 'chan_notif_1'
				}
			];
			vi.mocked(repoConfigsService.list).mockResolvedValueOnce(
				mockConfigs as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfigs);
			expect(repoConfigsService.list).toHaveBeenCalledOnce();
		});
	});

	// --- GET /:id (Get by ID) ---
	describe('GET /:id', () => {
		it('returns 200 and the configuration when found', async () => {
			const mockConfig = {
				id: 'cfg_1',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1'
			};
			vi.mocked(repoConfigsService.getById).mockResolvedValueOnce(
				mockConfig as any
			);

			const res = await app.request('/cfg_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfig);
			expect(repoConfigsService.getById).toHaveBeenCalledWith('cfg_1');
		});

		it('returns 404 when configuration is not found', async () => {
			vi.mocked(repoConfigsService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.success).toBe(false);
		});
	});

	// --- GET /command-channel/:commandChannelId ---
	describe('GET /command-channel/:commandChannelId', () => {
		it('returns 200 and the configuration when found by command channel', async () => {
			const mockConfig = {
				id: 'cfg_1',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_1',
				notificationChannelId: 'chan_notif_1'
			};
			vi.mocked(
				repoConfigsService.getByCommandChannelId
			).mockResolvedValueOnce(mockConfig as any);

			const res = await app.request('/command-channel/chan_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockConfig);
			expect(
				repoConfigsService.getByCommandChannelId
			).toHaveBeenCalledWith('chan_1');
		});

		it('returns 404 when configuration is not found by command channel', async () => {
			vi.mocked(
				repoConfigsService.getByCommandChannelId
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
			const created = { id: 'cfg_new', ...input };
			vi.mocked(repoConfigsService.create).mockResolvedValueOnce(
				created as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(created);
			expect(repoConfigsService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guildId: '' })
			});

			expect(res.status).toBe(400);
			expect(repoConfigsService.create).not.toHaveBeenCalled();
		});
	});

	// --- PATCH /:id (Update) ---
	describe('PATCH /:id', () => {
		it('returns 200 and the updated configuration when valid', async () => {
			const input = { commandChannelId: 'chan_updated' };
			const updated = {
				id: 'cfg_1',
				guildId: 'guild_1',
				repositoryUrl: 'https://github.com/owner/repo',
				commandChannelId: 'chan_updated',
				notificationChannelId: 'chan_notif_1'
			};
			vi.mocked(repoConfigsService.update).mockResolvedValueOnce(
				updated as any
			);

			const res = await app.request('/cfg_1', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(repoConfigsService.update).toHaveBeenCalledWith(
				'cfg_1',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when updating a non-existent configuration', async () => {
			vi.mocked(repoConfigsService.update).mockResolvedValueOnce(null);

			const res = await app.request('/missing', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandChannelId: 'chan_updated' })
			});

			expect(res.status).toBe(404);
		});
	});

	// --- DELETE /:id (Delete) ---
	describe('DELETE /:id', () => {
		it('returns 200 and success message when configuration is deleted', async () => {
			vi.mocked(repoConfigsService.delete).mockResolvedValueOnce(true);

			const res = await app.request('/cfg_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Repository configuration deleted successfully'
			});
			expect(repoConfigsService.delete).toHaveBeenCalledWith('cfg_1');
		});

		it('returns 404 when deleting a non-existent configuration', async () => {
			vi.mocked(repoConfigsService.delete).mockResolvedValueOnce(false);

			const res = await app.request('/missing', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
