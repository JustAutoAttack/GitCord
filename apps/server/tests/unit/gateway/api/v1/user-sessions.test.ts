import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { userSessionsRouter } from '@gateway/api/v1/user-sessions';
import { userSessionsService } from '@services';

vi.mock('@services', () => ({
	userSessionsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByUserId: vi.fn(),
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

app.route('/', userSessionsRouter);

describe('User Sessions API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('returns 200 and a list of user sessions', async () => {
			const mockSessions = [
				{
					id: 'sess_123456',
					userId: 'usr_123456',
					accessTokenEncrypted: 'encrypted_access_token_string',
					refreshTokenEncrypted: 'encrypted_refresh_token_string',
					expiresAt: '2026-09-17T14:30:00.000Z',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(userSessionsService.list).mockResolvedValueOnce(
				mockSessions
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSessions);
			expect(userSessionsService.list).toHaveBeenCalledOnce();
		});
	});

	describe('GET /user/{userId}', () => {
		it('returns 200 and the session when found by user ID', async () => {
			const mockSession = {
				id: 'sess_123456',
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.getByUserId).mockResolvedValueOnce(
				mockSession
			);

			const res = await app.request('/user/usr_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSession);
			expect(userSessionsService.getByUserId).toHaveBeenCalledWith(
				'usr_123456'
			);
		});

		it('returns 404 when session is not found by user ID', async () => {
			vi.mocked(userSessionsService.getByUserId).mockResolvedValueOnce(
				null
			);

			const res = await app.request('/user/usr_missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('User session not found');
		});
	});

	describe('GET /:id', () => {
		it('returns 200 and the session when found by ID', async () => {
			const mockSession = {
				id: 'sess_123456',
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.getById).mockResolvedValueOnce(
				mockSession
			);

			const res = await app.request('/sess_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSession);
			expect(userSessionsService.getById).toHaveBeenCalledWith(
				'sess_123456'
			);
		});

		it('returns 404 when session is not found by ID', async () => {
			vi.mocked(userSessionsService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/sess_missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('User session not found');
		});
	});

	describe('POST /', () => {
		it('returns 201 and the created session when payload is valid', async () => {
			const input = {
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z'
			};
			const created = {
				id: 'sess_123456',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.create).mockResolvedValueOnce(
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
			expect(userSessionsService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: '' })
			});

			expect(res.status).toBe(400);
			expect(userSessionsService.create).not.toHaveBeenCalled();
		});
	});

	describe('PATCH /:id', () => {
		it('returns 200 and the updated session when valid', async () => {
			const input = { accessTokenEncrypted: 'new_encrypted_token' };
			const updated = {
				id: 'sess_123456',
				userId: 'usr_123456',
				accessTokenEncrypted: 'new_encrypted_token',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.update).mockResolvedValueOnce(
				updated
			);

			const res = await app.request('/sess_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(userSessionsService.update).toHaveBeenCalledWith(
				'sess_123456',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service returns null on update', async () => {
			vi.mocked(userSessionsService.update).mockResolvedValueOnce(
				null as any
			);

			const res = await app.request('/sess_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accessTokenEncrypted: 'new_token' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 400 when payload fails Zod schema validation on update', async () => {
			const res = await app.request('/sess_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accessTokenEncrypted: '' })
			});

			expect(res.status).toBe(400);
			expect(userSessionsService.update).not.toHaveBeenCalled();
		});
	});

	describe('DELETE /:id', () => {
		it('returns 200 and success message when session is deleted', async () => {
			vi.mocked(userSessionsService.delete).mockResolvedValueOnce(true);

			const res = await app.request('/sess_123456', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'User session deleted successfully'
			});
			expect(userSessionsService.delete).toHaveBeenCalledWith(
				'sess_123456'
			);
		});

		it('returns 404 when service returns falsy on deletion', async () => {
			vi.mocked(userSessionsService.delete).mockResolvedValueOnce(false);

			const res = await app.request('/sess_123456', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
