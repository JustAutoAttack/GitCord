import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebhookDispatcherService } from '../../../../src/core/services/webhook-dispatcher';
import { cryptoService } from '../../../../src/core/services/crypto';
import { appLogger } from '../../../../src/core/loggers';

// Mock dependencies
vi.mock('../../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock('../../../../src/core/services/crypto', () => ({
	cryptoService: {
		createHmacSha256: vi.fn().mockReturnValue('mock-signature-hash')
	}
}));

describe('WebhookDispatcherService', () => {
	let dispatcher: WebhookDispatcherService;
	const originalFetch = global.fetch;

	beforeEach(() => {
		dispatcher = new WebhookDispatcherService();
		vi.clearAllMocks();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it('should successfully broadcast a webhook with correct signature and body', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK'
		});
		global.fetch = mockFetch;

		const endpointUrl = 'https://example.com/webhook';
		const secret = 'my-secret';
		const payload = {
			event: 'ping',
			timestamp: Date.now(),
			data: { id: 1 }
		};

		await dispatcher.broadcast(endpointUrl, secret, payload as any);

		expect(cryptoService.createHmacSha256).toHaveBeenCalledWith(
			secret,
			JSON.stringify(payload)
		);

		expect(mockFetch).toHaveBeenCalledWith(endpointUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-GitCord-Signature': 'mock-signature-hash'
			},
			body: JSON.stringify(payload)
		});

		expect(appLogger.warn).not.toHaveBeenCalled();
	});

	it('should log a warning if the endpoint returns a non-ok response', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error'
		});
		global.fetch = mockFetch;

		const endpointUrl = 'https://example.com/webhook';
		const secret = 'my-secret';
		const payload = { event: 'test', timestamp: Date.now() };

		await dispatcher.broadcast(endpointUrl, secret, payload as any);

		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining(
				`Failed to dispatch webhook to ${endpointUrl}: Internal Server Error`
			)
		);
	});

	it('should handle ECONNREFUSED network errors gracefully', async () => {
		const networkError: any = new Error('Fetch failed');
		networkError.cause = { code: 'ECONNREFUSED' };

		const mockFetch = vi.fn().mockRejectedValue(networkError);
		global.fetch = mockFetch;

		const endpointUrl = 'https://example.com/webhook';
		const secret = 'my-secret';
		const payload = { event: 'test', timestamp: Date.now() };

		await dispatcher.broadcast(endpointUrl, secret, payload as any);

		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining('Target endpoint is offline')
		);
	});

	it('should handle generic network errors gracefully', async () => {
		const mockFetch = vi
			.fn()
			.mockRejectedValue(new Error('DNS lookup failed'));
		global.fetch = mockFetch;

		const endpointUrl = 'https://example.com/webhook';
		const secret = 'my-secret';
		const payload = { event: 'test', timestamp: Date.now() };

		await dispatcher.broadcast(endpointUrl, secret, payload as any);

		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining('DNS lookup failed')
		);
	});

    it('should handle non-Error objects thrown during network failure', async () => {
		// Throw a string instead of an Error object
		const mockFetch = vi.fn().mockRejectedValue('String network failure');
		global.fetch = mockFetch;

		const endpointUrl = 'https://example.com/webhook';
		const secret = 'my-secret';
		const payload = { event: 'test', timestamp: Date.now() };

		await dispatcher.broadcast(endpointUrl, secret, payload as any);

		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining('String network failure')
		);
	});
});
