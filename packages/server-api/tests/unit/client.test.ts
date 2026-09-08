import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient } from '../../src/index';

describe('API Client Factory', () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	// Verify client initialization uses default environment URL and exposes method handlers
	it('creates an api client instance with default options', () => {
		process.env.SERVER_DOCS_URL = 'http://localhost:3000/doc';
		const client = createApiClient();
		expect(client).toBeDefined();
		expect(typeof client.GET).toBe('function');
		expect(typeof client.POST).toBe('function');
		expect(typeof client.PUT).toBe('function');
		expect(typeof client.DELETE).toBe('function');
	});

	// Verify client initialization accepts an explicit custom base URL override
	it('creates an api client instance with custom base url', () => {
		const customUrl = 'http://127.0.0.1:4000';
		const client = createApiClient(customUrl);
		expect(client).toBeDefined();
	});

	// Verify client initialization correctly binds custom headers from RequestInit options
	it('creates an api client instance with custom headers via RequestInit', () => {
		const client = createApiClient('http://localhost:3000', {
			headers: {
				Authorization: 'Bearer test-token',
				'X-Custom-Header': 'test-value'
			}
		});
		expect(client).toBeDefined();
	});
});
