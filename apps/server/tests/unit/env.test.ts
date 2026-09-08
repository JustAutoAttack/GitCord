import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Mock dotenv globally to isolate test execution from local .env files
vi.mock('dotenv', () => ({
	default: {
		config: vi.fn(() => ({ parsed: process.env }))
	}
}));

describe('ENV Configuration', () => {
	const originalEnv = process.env;
	let exitSpy: any;
	let consoleErrorSpy: any;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
		exitSpy = vi
			.spyOn(process, 'exit')
			.mockImplementation((code?: string | number | null | undefined) => {
				throw new Error(`process.exit called with code ${code}`);
			});
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	// --- Valid Environment Variables ---
	it('successfully loads and parses valid environment variables', async () => {
		process.env.PORT = '4000';
		process.env.JWT_SECRET = 'secret1';
		process.env.JWT_REFRESH_SECRET = 'refresh1';
		process.env.DATABASE_URL = 'sqlite://test.db';

		const { ENV } = await import('@core/env.js');

		expect(ENV.PORT).toBe(4000);
		expect(ENV.JWT_SECRET).toBe('secret1');
		expect(ENV.JWT_REFRESH_SECRET).toBe('refresh1');
		expect(ENV.DATABASE_URL).toBe('sqlite://test.db');
	});

	// --- Default Port Fallback ---
	it('applies default PORT when PORT is omitted', async () => {
		delete process.env.PORT;
		process.env.JWT_SECRET = 'secret1';
		process.env.JWT_REFRESH_SECRET = 'refresh1';
		process.env.DATABASE_URL = 'sqlite://test.db';

		const { ENV } = await import('@core/env.js');
		expect(ENV.PORT).toBe(3000);
	});

	// --- Dotenv File Load Failure ---
	it('exits process if dotenv fails to load environment file', async () => {
		vi.mocked(dotenv.config).mockReturnValueOnce({
			error: new Error('File read failure')
		} as any);

		await expect(async () => {
			await import('@core/env.js');
		}).rejects.toThrow('process.exit called with code 1');

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining('Failed to load environment file'),
			expect.any(Error)
		);
	});

	// --- Zod Validation Failure ---
	it('exits process if required environment variables fail Zod validation', async () => {
		delete process.env.JWT_SECRET;
		process.env.PORT = 'invalid-port';

		await expect(async () => {
			await import('@core/env.js');
		}).rejects.toThrow('process.exit called with code 1');

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Invalid environment variables:'
		);
	});
});
