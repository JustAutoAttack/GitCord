import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { guildUserPermissionsRouter } from '@gateway/api/v1/guild-user-permissions';
import { guildUserPermissionsService } from '@services';

vi.mock('@services', () => ({
	guildUserPermissionsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByGuildAndUser: vi.fn(),
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

app.route('/', guildUserPermissionsRouter);

describe('Guild User Permissions API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('returns 200 and a list of guild user permissions', async () => {
			const mockPermissions = [
				{
					id: 'perm_123456',
					guildId: '123456789012345678',
					discordUserId: '987654321098765432',
					commandId: 'cmd_123456',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(guildUserPermissionsService.list).mockResolvedValueOnce(
				mockPermissions
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockPermissions);
			expect(guildUserPermissionsService.list).toHaveBeenCalledOnce();
		});
	});

	describe('GET /lookup', () => {
		it('returns 200 and permissions when found by guild and user', async () => {
			const mockPermissions = [
				{
					id: 'perm_123456',
					guildId: '123456789012345678',
					discordUserId: '987654321098765432',
					commandId: 'cmd_123456',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(
				guildUserPermissionsService.getByGuildAndUser
			).mockResolvedValueOnce(mockPermissions);

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

		it('returns 400 when query params fail validation on lookup', async () => {
			const res = await app.request('/lookup?guildId=');
			expect(res.status).toBe(400);
			expect(
				guildUserPermissionsService.getByGuildAndUser
			).not.toHaveBeenCalled();
		});
	});

	describe('GET /:id', () => {
		it('returns 200 and the permission when found', async () => {
			const mockPermission = {
				id: 'perm_123456',
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_123456',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(
				guildUserPermissionsService.getById
			).mockResolvedValueOnce(mockPermission);

			const res = await app.request('/perm_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockPermission);
			expect(guildUserPermissionsService.getById).toHaveBeenCalledWith(
				'perm_123456'
			);
		});

		it('returns 404 when permission is not found', async () => {
			vi.mocked(
				guildUserPermissionsService.getById
			).mockResolvedValueOnce(null);

			const res = await app.request('/perm_missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('Guild user permission not found');
		});
	});

	describe('POST /', () => {
		it('returns 201 and the created permission when payload is valid', async () => {
			const input = {
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_123456'
			};
			const created = {
				id: 'perm_123456',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildUserPermissionsService.create).mockResolvedValueOnce(
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
			expect(guildUserPermissionsService.create).toHaveBeenCalledWith(
				input
			);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guildId: '' })
			});

			expect(res.status).toBe(400);
			expect(guildUserPermissionsService.create).not.toHaveBeenCalled();
		});
	});

	describe('PATCH /:id', () => {
		it('returns 200 and the updated permission when valid', async () => {
			const input = { commandId: 'cmd_updated' };
			const updated = {
				id: 'perm_123456',
				guildId: '123456789012345678',
				discordUserId: '987654321098765432',
				commandId: 'cmd_updated',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(guildUserPermissionsService.update).mockResolvedValueOnce(
				updated
			);

			const res = await app.request('/perm_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(guildUserPermissionsService.update).toHaveBeenCalledWith(
				'perm_123456',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service throws NOT_FOUND error', async () => {
			vi.mocked(guildUserPermissionsService.update).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Guild user permission not found'
				)
			);

			const res = await app.request('/perm_missing', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandId: 'cmd_updated' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 404 when service returns null on update', async () => {
			vi.mocked(guildUserPermissionsService.update).mockResolvedValueOnce(
				null as any
			);

			const res = await app.request('/perm_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandId: 'cmd_updated' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 400 when payload fails Zod schema validation on update', async () => {
			const res = await app.request('/perm_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandId: '' })
			});

			expect(res.status).toBe(400);
			expect(guildUserPermissionsService.update).not.toHaveBeenCalled();
		});
	});

	describe('DELETE /:id', () => {
		it('returns 200 and success message when permission is deleted', async () => {
			vi.mocked(guildUserPermissionsService.delete).mockResolvedValueOnce(
				true
			);

			const res = await app.request('/perm_123456', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Guild user permission deleted successfully'
			});
			expect(guildUserPermissionsService.delete).toHaveBeenCalledWith(
				'perm_123456'
			);
		});

		it('returns 404 when service throws NOT_FOUND error during deletion', async () => {
			vi.mocked(guildUserPermissionsService.delete).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Guild user permission not found'
				)
			);

			const res = await app.request('/perm_missing', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});

		it('returns 404 when service returns falsy on deletion', async () => {
			vi.mocked(guildUserPermissionsService.delete).mockResolvedValueOnce(
				false
			);

			const res = await app.request('/perm_123456', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
