import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { userSessionsService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByIDHandler,
	getByUserIdHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/user-sessions/handlers';
import {
	listRoute,
	getByIDRoute,
	getByUserIdRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/user-sessions/routes';

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

vi.mock('../../../../src/gateway/api/v1/user-sessions/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('User Sessions Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByUserIdRoute, getByUserIdHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all user sessions', async () => {
			const mockSessions: any[] = [
				{
					id: 'sess_1',
					userId: 'usr_123456',
					accessTokenEncrypted: 'encrypted_access_token_string',
					refreshTokenEncrypted: 'encrypted_refresh_token_string',
					expiresAt: '2026-09-17T14:30:00.000Z'
				}
			];
			vi.mocked(userSessionsService.list).mockResolvedValue(
				mockSessions as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSessions);
			expect(userSessionsService.list).toHaveBeenCalled();
		});
	});

	describe('GET /{id}', () => {
		it('should get a user session by ID', async () => {
			const mockSession = {
				id: 'sess_1',
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.getById).mockResolvedValue(
				mockSession as any
			);

			const res = await app.request('/sess_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSession);
			expect(userSessionsService.getById).toHaveBeenCalledWith('sess_1');
		});

		it('should return 404 when user session by ID is not found', async () => {
			vi.mocked(userSessionsService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/sess_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /user/{userId}', () => {
		it('should get a user session by User ID', async () => {
			const mockSession = {
				id: 'sess_1',
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue(
				mockSession as any
			);

			const res = await app.request('/user/usr_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockSession);
			expect(userSessionsService.getByUserId).toHaveBeenCalledWith(
				'usr_123456'
			);
		});

		it('should return 404 when user session by User ID is not found', async () => {
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue(
				null as any
			);

			const res = await app.request('/user/usr_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a user session', async () => {
			const newPayload = {
				userId: 'usr_123456',
				accessTokenEncrypted: 'encrypted_access_token_string',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z'
			};
			const createdSession = { id: 'sess_1', ...newPayload };
			vi.mocked(userSessionsService.create).mockResolvedValue(
				createdSession as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdSession);
			expect(userSessionsService.create).toHaveBeenCalledWith(newPayload);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a user session', async () => {
			const updatePayload = {
				accessTokenEncrypted: 'new_encrypted_token'
			};
			const updatedSession = {
				id: 'sess_1',
				userId: 'usr_123456',
				accessTokenEncrypted: 'new_encrypted_token',
				refreshTokenEncrypted: 'encrypted_refresh_token_string',
				expiresAt: '2026-09-17T14:30:00.000Z'
			};
			vi.mocked(userSessionsService.update).mockResolvedValue(
				updatedSession as any
			);

			const res = await app.request('/sess_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedSession);
			expect(userSessionsService.update).toHaveBeenCalledWith(
				'sess_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent user session', async () => {
			vi.mocked(userSessionsService.update).mockResolvedValue(
				null as any
			);

			const res = await app.request('/sess_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ accessTokenEncrypted: 'token' })
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a user session', async () => {
			vi.mocked(userSessionsService.delete).mockResolvedValue(
				true as any
			);

			const res = await app.request('/sess_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'User session deleted successfully'
			});
			expect(userSessionsService.delete).toHaveBeenCalledWith('sess_1');
		});

		it('should return 404 when deleting a non-existent user session', async () => {
			vi.mocked(userSessionsService.delete).mockResolvedValue(
				false as any
			);

			const res = await app.request('/sess_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
