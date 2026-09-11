import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@app/index.js', () => ({
	createApp: vi.fn(() => ({ fetch: vi.fn() }))
}));

vi.mock('@database/index.js', () => ({
	migrateDatabase: vi.fn()
}));

vi.mock('@hono/node-server', () => ({
	serve: vi.fn()
}));

vi.mock('@core/index.js', async () => {
	const actual =
		await vi.importActual<typeof import('@core/index.js')>(
			'@core/index.js'
		);
	return {
		...actual,
		appLogger: {
			info: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('index.ts entrypoint', () => {
	const originalExit = process.exit;

	beforeEach(() => {
		vi.resetModules();
		process.exit = vi.fn() as unknown as typeof process.exit;
	});

	afterEach(() => {
		process.exit = originalExit;
		vi.clearAllMocks();
	});

	it('initializes and starts the server successfully', async () => {
		const { migrateDatabase } = await import('@database/index.js');
		const { serve } = await import('@hono/node-server');

		await import('../../src/index.js');

		expect(migrateDatabase).toHaveBeenCalled();
		expect(serve).toHaveBeenCalled();
	});

	it('handles startup errors gracefully, logs, and exits', async () => {
		const { migrateDatabase } = await import('@database/index.js');
		vi.mocked(migrateDatabase).mockImplementationOnce(() => {
			throw new Error('Migration failure');
		});

		await import('../../src/index.js');

		expect(process.exit).toHaveBeenCalledWith(1);
	});
});
