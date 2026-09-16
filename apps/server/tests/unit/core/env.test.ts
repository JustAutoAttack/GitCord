import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';

vi.mock('dotenv', () => ({
	default: {
		config: vi.fn()
	}
}));

describe('Environment Loader', () => {
	const originalEnv = process.env;
	const originalExit = process.exit;
	const originalConsoleError = console.error;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
		// Prevent actual process termination during tests
		process.exit = vi.fn() as unknown as typeof process.exit;
		console.error = vi.fn();
	});

	afterEach(() => {
		process.env = originalEnv;
		process.exit = originalExit;
		console.error = originalConsoleError;
		vi.clearAllMocks();
	});

	const setValidEnv = () => {
		process.env.NODE_ENV = 'development';
		process.env.PORT = '4000';
		process.env.BASE_URL = 'http://localhost:4000';
		process.env.JWT_SECRET = 'secret1';
		process.env.JWT_REFRESH_SECRET = 'secret2';
		process.env.DISCORD_BOT_TOKEN = 'discord-token';
		process.env.DISCORD_CLIENT_ID = 'discord-client-id';
		process.env.DISCORD_CLIENT_SECRET = 'discord-client-secret';
		process.env.DISCORD_REDIRECT_URI =
			'http://localhost:4000/api/v1/auth/discord/callback';
		process.env.DATABASE_URL = 'sqlite://local.db';
		process.env.BOT_WEBHOOK_URL = 'http://localhost:4000/webhook';
		process.env.BOT_WEBHOOK_SECRET = 'webhook-secret';
		process.env.GITHUB_APP_ID = '12345';
		process.env.GITHUB_APP_SLUG = 'github-app-slug';
		process.env.GITHUB_CLIENT_ID = 'gh-client';
		process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
		process.env.GITHUB_PRIVATE_KEY = 'gh-key';
		process.env.GITHUB_WEBHOOK_SECRET = 'gh-webhook-secret';
	};

	it('should successfully load and validate environment variables', async () => {
		setValidEnv();
		vi.mocked(dotenv.config).mockReturnValue({ parsed: {} });

		const { ENV } = await import('../../../src/core/env/loader.js');

		expect(ENV).toBeDefined();
		expect(ENV.PORT).toBe(4000);
		expect(ENV.GITHUB_APP_ID).toBe(12345);
		expect(ENV.DISCORD_CLIENT_ID).toBe('discord-client-id');
		expect(process.exit).not.toHaveBeenCalled();
	});

	it('should exit with code 1 if dotenv config returns an error', async () => {
		vi.mocked(dotenv.config).mockReturnValue({
			error: Object.assign(new Error('Missing file'), {
				code: 'MISSING_DATA'
			})
		} as any);

		await import('../../../src/core/env/loader.js');

		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining('Failed to load environment file'),
			expect.any(Error)
		);
		expect(process.exit).toHaveBeenCalledWith(1);
	});

	it('should exit with code 1 if Zod validation fails due to missing variables', async () => {
		// Leave required variables empty / invalid
		process.env.BASE_URL = 'not-a-url';
		vi.mocked(dotenv.config).mockReturnValue({ parsed: {} });

		await import('../../../src/core/env/loader.js');

		expect(console.error).toHaveBeenCalledWith(
			'Invalid environment variables:'
		);
		expect(process.exit).toHaveBeenCalledWith(1);
	});
});
