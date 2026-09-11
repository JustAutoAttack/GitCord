import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { botCommandsRouter } from '@gateway/api/v1/bot-commands';
import { botCommandsService } from '@services';

vi.mock('@services', () => ({
	botCommandsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByCommandName: vi.fn(),
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

app.route('/', botCommandsRouter);

describe('Bot Commands API Gateway', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- GET / (List) ---
	describe('GET /', () => {
		it('returns 200 and a list of bot commands', async () => {
			const mockCommands = [
				{
					id: 'cmd_123456',
					commandName: 'sync',
					description: 'Synchronize repository branches',
					createdAt: '2026-08-01T10:00:00.000Z',
					updatedAt: '2026-08-17T14:30:00.000Z'
				}
			];
			vi.mocked(botCommandsService.list).mockResolvedValueOnce(
				mockCommands
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommands);
			expect(botCommandsService.list).toHaveBeenCalledOnce();
		});
	});

	// --- GET /name/{commandName} ---
	describe('GET /name/{commandName}', () => {
		it('returns 200 and command when found by name', async () => {
			const mockCommand = {
				id: 'cmd_123456',
				commandName: 'sync',
				description: 'Synchronize repository branches',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(
				botCommandsService.getByCommandName
			).mockResolvedValueOnce(mockCommand);

			const res = await app.request('/name/sync');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommand);
			expect(botCommandsService.getByCommandName).toHaveBeenCalledWith(
				'sync'
			);
		});

		it('returns 404 when command is not found by name', async () => {
			vi.mocked(
				botCommandsService.getByCommandName
			).mockResolvedValueOnce(null);

			const res = await app.request('/name/unknown');

			expect(res.status).toBe(404);
		});
	});

	// --- GET /:id (Get by ID) ---
	describe('GET /:id', () => {
		it('returns 200 and the command when found', async () => {
			const mockCommand = {
				id: 'cmd_123456',
				commandName: 'sync',
				description: 'Synchronize repository branches',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(botCommandsService.getById).mockResolvedValueOnce(
				mockCommand
			);

			const res = await app.request('/cmd_123456');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommand);
			expect(botCommandsService.getById).toHaveBeenCalledWith(
				'cmd_123456'
			);
		});

		it('returns 404 when command is not found', async () => {
			vi.mocked(botCommandsService.getById).mockResolvedValueOnce(null);

			const res = await app.request('/cmd_missing');
			const body = (await res.json()) as any;

			expect(res.status).toBe(404);
			expect(body.message).toBe('Bot command not found');
		});
	});

	// --- POST / (Create) ---
	describe('POST /', () => {
		it('returns 201 and the created command when payload is valid', async () => {
			const input = {
				commandName: 'sync',
				description: 'Synchronize repository branches'
			};
			const created = {
				id: 'cmd_123456',
				...input,
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(botCommandsService.create).mockResolvedValueOnce(created);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(created);
			expect(botCommandsService.create).toHaveBeenCalledWith(input);
		});

		it('returns 400 when payload fails Zod schema validation', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commandName: '' })
			});

			expect(res.status).toBe(400);
			expect(botCommandsService.create).not.toHaveBeenCalled();
		});
	});

	// --- PATCH /:id (Update) ---
	describe('PATCH /:id', () => {
		it('returns 200 and the updated command when valid', async () => {
			const input = { description: 'Updated description' };
			const updated = {
				id: 'cmd_123456',
				commandName: 'sync',
				description: 'Updated description',
				createdAt: '2026-08-01T10:00:00.000Z',
				updatedAt: '2026-08-17T14:30:00.000Z'
			};
			vi.mocked(botCommandsService.update).mockResolvedValueOnce(updated);

			const res = await app.request('/cmd_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updated);
			expect(botCommandsService.update).toHaveBeenCalledWith(
				'cmd_123456',
				expect.objectContaining(input)
			);
		});

		it('returns 404 when service throws NOT_FOUND error', async () => {
			vi.mocked(botCommandsService.update).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Bot command not found for update'
				)
			);

			const res = await app.request('/cmd_missing', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: 'Updated description' })
			});

			expect(res.status).toBe(404);
		});

		it('returns 200 when service returns null on update', async () => {
			vi.mocked(botCommandsService.update).mockResolvedValueOnce(
				null as any
			);

			const res = await app.request('/cmd_123456', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: 'Updated description' })
			});

			expect(res.status).toBe(200);
		});
	});

	// --- DELETE /:id (Delete) ---
	describe('DELETE /:id', () => {
		it('returns 200 and success message when command is deleted', async () => {
			vi.mocked(botCommandsService.delete).mockResolvedValueOnce(true);

			const res = await app.request('/cmd_123456', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Bot command deleted successfully'
			});
			expect(botCommandsService.delete).toHaveBeenCalledWith(
				'cmd_123456'
			);
		});

		it('returns 404 when service throws NOT_FOUND error during deletion', async () => {
			vi.mocked(botCommandsService.delete).mockRejectedValueOnce(
				new AppError(
					ErrorCode.NOT_FOUND,
					'Bot command not found for deletion'
				)
			);

			const res = await app.request('/cmd_missing', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});

		it('returns 200 when service returns falsy on deletion', async () => {
			vi.mocked(botCommandsService.delete).mockResolvedValueOnce(false);

			const res = await app.request('/cmd_123456', {
				method: 'DELETE'
			});

			expect(res.status).toBe(200);
		});
	});

	it('returns 400 when payload fails Zod schema validation on update', async () => {
		const res = await app.request('/cmd_123456', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ commandName: '' })
		});

		expect(res.status).toBe(400);
		expect(botCommandsService.update).not.toHaveBeenCalled();
	});
});
