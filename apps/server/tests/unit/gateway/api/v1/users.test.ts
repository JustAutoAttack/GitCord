import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { usersRouter } from '@gateway/api/v1/users';
import { usersService } from '@services';

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

app.route('/', usersRouter);

describe('Users API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('returns 200 and a list of users', async () => {
			const mockUsers = [
				{
					id: 'usr_123456',
					discordId: '123456789012345678',
					displayName: 'JohnDoe',
					avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(usersService.list).mockResolvedValueOnce(mockUsers);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUsers);
			expect(usersService.list).toHaveBeenCalledOnce();
		});
	});

	describe('GET /discord/{discordId}', () => {
		it('returns 200 and the user when found by Discord ID', async () => {
			const mockUser = {
				id: 'usr_123456',
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(usersService.getByDiscordId).mockResolvedValueOnce(
				mockUser
			);

			const res = await app.request('/discord/123456789012345678');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUser);
			expect(usersService.getByDiscordId).toHaveBeenCalledWith(
				'123456789012345678'
			);
		});

		it('returns 404 when user is not found by Discord ID', async () => {
			vi.mocked(usersService.getByDiscordId).mockResolvedValueOnce(null);

			const res = await app.request('/discord/999999999999999999');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('User not found');
		});
	});

	describe('GET /:id', () => {
		it('returns 200 and the user when found by ID', async () => {
			const mockUser = {
				id: 'usr_123456',
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(usersService.getById).mockResolvedValueOnce(mockUser);

			const res = await app.request('/usr_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockUser);
			expect(usersService.getById).toHaveBeenCalledWith('usr_123456');
		});

		it('returns 404 when user is not found by ID', async () => {
			vi.mocked(usersService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/usr_missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('User not found');
		});
	});

	describe('POST /', () => {
		it('returns 201 and the created user when payload is valid', async () => {
			const input = {
				discordId: '123456789012345678',
				displayName: 'JohnDoe',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
			};
			const created = {
				id: 'usr_123456',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(usersService.create).mockResolvedValueOnce(created);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(created);
			expect(usersService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ discordId: '' })
			});

			expect(res.status).toBe(400);
			expect(usersService.create).not.toHaveBeenCalled();
		});
	});

	describe('PATCH /:id', () => {
		it('returns 200 and the updated user when valid', async () => {
			const input = { displayName: 'JohnDoeUpdated' };
			const updated = {
				id: 'usr_123456',
				discordId: '123456789012345678',
				displayName: 'JohnDoeUpdated',
				avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(usersService.update).mockResolvedValueOnce(updated);

			const res = await app.request('/usr_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(usersService.update).toHaveBeenCalledWith(
				'usr_123456',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service returns null on update', async () => {
			vi.mocked(usersService.update).mockResolvedValueOnce(null as any);

			const res = await app.request('/usr_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ displayName: 'NewName' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 400 when payload fails Zod schema validation on update', async () => {
			const res = await app.request('/usr_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ avatarUrl: 'not-a-url' })
			});

			expect(res.status).toBe(400);
			expect(usersService.update).not.toHaveBeenCalled();
		});
	});

	describe('DELETE /:id', () => {
		it('returns 200 and success message when user is deleted', async () => {
			vi.mocked(usersService.delete).mockResolvedValueOnce(true);

			const res = await app.request('/usr_123456', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'User deleted successfully'
			});
			expect(usersService.delete).toHaveBeenCalledWith('usr_123456');
		});

		it('returns 404 when service returns falsy on deletion', async () => {
			vi.mocked(usersService.delete).mockResolvedValueOnce(false);

			const res = await app.request('/usr_123456', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
