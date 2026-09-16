import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { botCommandsService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByIDHandler,
	getByNameHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/bot-commands/handlers';
import {
	listRoute,
	getByIDRoute,
	getByNameRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/bot-commands/routes';

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

vi.mock('../../../../src/gateway/api/v1/bot-commands/logger', () => ({
	logger: {
		debug: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('Bot Commands Handlers', () => {
	const app = new OpenAPIHono();

	// Register error handler to map AppErrors (like 404) correctly
	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByNameRoute, getByNameHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all bot commands', async () => {
			const mockCommands = [{ id: 'cmd_1', commandName: 'sync' }];
			vi.mocked(botCommandsService.list).mockResolvedValue(
				mockCommands as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommands);
			expect(botCommandsService.list).toHaveBeenCalledTimes(1);
		});
	});

	describe('GET /{id}', () => {
		it('should get a bot command by ID', async () => {
			const mockCommand = { id: 'cmd_1', commandName: 'sync' };
			vi.mocked(botCommandsService.getById).mockResolvedValue(
				mockCommand as any
			);

			const res = await app.request('/cmd_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommand);
			expect(botCommandsService.getById).toHaveBeenCalledWith('cmd_1');
		});

		it('should return 404 when bot command by ID is not found', async () => {
			vi.mocked(botCommandsService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/cmd_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /name/{commandName}', () => {
		it('should get a bot command by name', async () => {
			const mockCommand = { id: 'cmd_1', commandName: 'sync' };
			vi.mocked(botCommandsService.getByCommandName).mockResolvedValue(
				mockCommand as any
			);

			const res = await app.request('/name/sync');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockCommand);
			expect(botCommandsService.getByCommandName).toHaveBeenCalledWith(
				'sync'
			);
		});

		it('should return 404 when bot command by name is not found', async () => {
			vi.mocked(botCommandsService.getByCommandName).mockResolvedValue(
				null as any
			);

			const res = await app.request('/name/nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a bot command', async () => {
			const newCommand = {
				commandName: 'deploy',
				description: 'Deploy app'
			};
			const createdCommand = { id: 'cmd_2', ...newCommand };
			vi.mocked(botCommandsService.create).mockResolvedValue(
				createdCommand as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newCommand)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdCommand);
			expect(botCommandsService.create).toHaveBeenCalledWith(newCommand);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a bot command', async () => {
			const updatePayload = { description: 'Updated' };
			const updatedCommand = {
				id: 'cmd_1',
				commandName: 'sync',
				description: 'Updated'
			};
			vi.mocked(botCommandsService.update).mockResolvedValue(
				updatedCommand as any
			);

			const res = await app.request('/cmd_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedCommand);
			expect(botCommandsService.update).toHaveBeenCalledWith(
				'cmd_1',
				updatePayload
			);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a bot command', async () => {
			vi.mocked(botCommandsService.delete).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/cmd_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'Bot command deleted successfully'
			});
			expect(botCommandsService.delete).toHaveBeenCalledWith('cmd_1');
		});
	});
});
