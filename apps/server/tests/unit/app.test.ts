import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ENV } from '@core';
import { createApp } from '@app';
import { migrateDatabase } from '@database';
import { AppError, ErrorCode } from '@core';

vi.mock('@database', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@database')>();
	return {
		...actual,
		migrateDatabase: vi.fn(),
		botCommandsRepo: {},
		usersRepo: {},
		userSessionsRepo: {}
	};
});

vi.mock('@gateway', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@gateway')>();
	return {
		...actual,
		healthRouter: new (await import('hono')).Hono().get('/', (c) =>
			c.json({ status: 'ok' })
		)
	};
});

vi.mock('@hono/node-server', () => ({
	serve: vi.fn()
}));

describe('Application Factory and Server Entrypoint', () => {
	let consoleLogSpy: any;
	let consoleErrorSpy: any;
	let exitSpy: any;

	beforeEach(() => {
		vi.resetModules();
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		exitSpy = vi
			.spyOn(process, 'exit')
			.mockImplementation((code?: string | number | null | undefined) => {
				throw new Error(`process.exit called with code ${code}`);
			});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('creates a valid OpenAPIHono application instance with all routes configured', async () => {
		const app = createApp();
		expect(app).toBeDefined();

		const res = await app.request('/health');
		expect(res.status).toBe(200);
	});

	it('handles custom AppErrors globally via error handling middleware', async () => {
		const app = createApp();
		app.get('/test-app-error', () => {
			throw new AppError(ErrorCode.NOT_FOUND, 'Resource not found');
		});

		const res = await app.request('/test-app-error');
		expect(res.status).toBe(404);
		const json = (await res.json()) as Record<string, any>;
		expect(json.success).toBe(false);
		expect(json.error).toBe('Resource not found');
	});

	it('handles unexpected generic errors with 500 internal server error response', async () => {
		const app = createApp();
		app.get('/test-generic-error', () => {
			throw new Error('Unexpected database failure');
		});

		const res = await app.request('/test-generic-error');
		expect(res.status).toBe(500);
		const json = (await res.json()) as Record<string, any>;
		expect(json.success).toBe(false);
		expect(json.error).toBe('Unexpected database failure');
	});

	it('successfully boots the database and server in the index entrypoint', async () => {
		const serveModule = await import('@hono/node-server');
		const url = new URL(ENV.BASE_URL);
		const expectedPort = url.port
			? parseInt(url.port, 10)
			: url.protocol === 'https:'
				? 443
				: 80;

		await import('../../src/index.js');

		expect(migrateDatabase).toHaveBeenCalledTimes(1);
		expect(serveModule.serve).toHaveBeenCalledWith({
			fetch: expect.any(Function),
			port: expectedPort
		});
	});

	it('catches startup exceptions, logs error, and exits process with code 1', async () => {
		vi.mocked(migrateDatabase).mockImplementationOnce(() => {
			throw new Error('Migration critical failure');
		});

		await expect(async () => {
			await import('../../src/index.js');
		}).rejects.toThrow('process.exit called with code 1');

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining('Failed to start GitCord server')
		);
	});
});
