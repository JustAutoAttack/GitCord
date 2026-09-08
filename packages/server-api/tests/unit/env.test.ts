import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Configuration Validation', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('successfully parses valid SERVER_DOCS_URL with development env', async () => {
		process.env.NODE_ENV = 'development';
		process.env.SERVER_DOCS_URL = 'http://example.com/doc';

		const { getEnv } = await import('../../src/env');
		const env = getEnv(process.env);
		expect(env.SERVER_DOCS_URL).toBe('http://example.com/doc');
	});

	it('successfully parses valid SERVER_DOCS_URL with production env', async () => {
		process.env.NODE_ENV = 'production';
		process.env.SERVER_DOCS_URL = 'http://example.com/doc';

		const { getEnv } = await import('../../src/env');
		const env = getEnv(process.env);
		expect(env.SERVER_DOCS_URL).toBe('http://example.com/doc');
	});

	it('applies default URL when SERVER_DOCS_URL is missing and NODE_ENV is unset', async () => {
		delete process.env.NODE_ENV;
		delete process.env.SERVER_DOCS_URL;

		const { getEnv } = await import('../../src/env');
		const env = getEnv(process.env);
		expect(env.SERVER_DOCS_URL).toBe('http://localhost:3000/doc');
	});

	it('throws an error when SERVER_DOCS_URL is malformed', async () => {
		process.env.SERVER_DOCS_URL = 'not-a-valid-url';

		await expect(import('../../src/env')).rejects.toThrow();
	});
});
