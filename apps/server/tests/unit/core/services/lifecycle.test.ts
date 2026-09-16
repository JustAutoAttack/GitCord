import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serve } from '@hono/node-server';
import { forward } from '@ngrok/ngrok';

import {
	LifecycleService,
	lifecycleService,
	ENV,
	appLogger,
	webhookDispatcher
} from '@core';

// Mock dependencies
vi.mock('@hono/node-server', () => ({
	serve: vi.fn()
}));

vi.mock('@ngrok/ngrok', () => ({
	forward: vi.fn()
}));

vi.mock('../../../../src/env', () => ({
	ENV: {
		PORT: 3000,
		BASE_URL: 'http://localhost:3000',
		NGROK_AUTHTOKEN: '',
		NGROK_URL: '',
		BOT_WEBHOOK_URL: '',
		BOT_WEBHOOK_SECRET: ''
	}
}));

vi.mock('../../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn()
	}
}));

vi.mock('../../../../src/core/services/webhook-dispatcher', () => ({
	webhookDispatcher: {
		broadcast: vi.fn().mockResolvedValue(undefined)
	}
}));

describe('LifecycleService', () => {
	let service: LifecycleService;
	let mockServerClose: any;
	let mockNgrokClose: any;
	let mockNgrokUrl: any;
	let exitSpy: any;

	beforeEach(() => {
		service = new LifecycleService();
		vi.clearAllMocks();

		mockServerClose = vi.fn((cb) => cb && cb());
		(serve as any).mockReturnValue({ close: mockServerClose });

		mockNgrokClose = vi.fn().mockResolvedValue(undefined);
		mockNgrokUrl = vi.fn().mockReturnValue('https://mock.ngrok-free.app');
		(forward as any).mockResolvedValue({
			url: mockNgrokUrl,
			close: mockNgrokClose
		});

		// Spy on process.exit to prevent test runner termination
		exitSpy = vi
			.spyOn(process, 'exit')
			.mockImplementation((() => {}) as any);
	});

	afterEach(() => {
		exitSpy.mockRestore();
	});

	describe('start()', () => {
		it('should start the server successfully with minimal env configuration', async () => {
			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(serve).toHaveBeenCalledWith({
				fetch: expect.any(Function),
				port: 3000
			});
			expect(appLogger.info).toHaveBeenCalledWith(
				expect.stringContaining('GitCord server is up and running')
			);
		});

		it('should initialize ngrok tunnel when NGROK_AUTHTOKEN is provided', async () => {
			(ENV as any).NGROK_AUTHTOKEN = 'token-123';
			(ENV as any).NGROK_URL = 'https://custom.ngrok-free.app';

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(forward).toHaveBeenCalledWith({
				addr: 3000,
				authtoken: 'token-123',
				domain: 'custom.ngrok-free.app'
			});
			expect(appLogger.info).toHaveBeenCalledWith(
				expect.stringContaining(
					'[ngrok] Tunnel established successfully'
				)
			);

			// Cleanup env overrides
			(ENV as any).NGROK_AUTHTOKEN = '';
			(ENV as any).NGROK_URL = '';
		});

		it('should handle raw ngrok domain hostname without protocol prefix', async () => {
			(ENV as any).NGROK_AUTHTOKEN = 'token-123';
			(ENV as any).NGROK_URL = 'my-custom-tunnel.ngrok-free.app';

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(forward).toHaveBeenCalledWith({
				addr: 3000,
				authtoken: 'token-123',
				domain: 'my-custom-tunnel.ngrok-free.app'
			});

			// Cleanup env overrides
			(ENV as any).NGROK_AUTHTOKEN = '';
			(ENV as any).NGROK_URL = '';
		});

		it('should handle ngrok setup failure gracefully', async () => {
			(ENV as any).NGROK_AUTHTOKEN = 'token-123';
			(forward as any).mockRejectedValue(new Error('Ngrok failed'));

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(appLogger.error).toHaveBeenCalledWith(
				'[ngrok] Failed to establish tunnel:',
				expect.any(Error)
			);

			(ENV as any).NGROK_AUTHTOKEN = '';
		});

		it('should broadcast startup webhook successfully when configured', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				'https://bot.example.com/lifecycle',
				'secret-abc',
				expect.objectContaining({
					data: {
						status: 'ONLINE',
						reason: 'Server startup complete'
					}
				})
			);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});

		it('should handle webhook ECONNREFUSED gracefully on startup', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com/';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			const connError: any = new Error('Refused');
			connError.code = 'ECONNREFUSED';
			(webhookDispatcher.broadcast as any).mockRejectedValueOnce(
				connError
			);

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Bot target endpoint was offline during startup notification.'
			);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});

		it('should handle webhook error with nested error.cause.code === ECONNREFUSED', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			const nestedConnError: any = new Error('Fetch failed');
			nestedConnError.cause = { code: 'ECONNREFUSED' };

			(webhookDispatcher.broadcast as any).mockRejectedValueOnce(
				nestedConnError
			);

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Bot target endpoint was offline during startup notification.'
			);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});

		it('should handle general webhook errors with warning on startup', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			(webhookDispatcher.broadcast as any).mockRejectedValueOnce(
				new Error('Auth failed')
			);

			const appFactory = () => ({ fetch: vi.fn() });

			await service.start(appFactory);

			expect(appLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining(
					'Failed to dispatch online webhook: Auth failed'
				)
			);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});
	});

	describe('handleShutdown()', () => {
		it('should prevent concurrent shutdowns if already shutting down', async () => {
			const p1 = service.handleShutdown('SIGTERM');
			const p2 = service.handleShutdown('SIGTERM');

			await Promise.all([p1, p2]);
			expect(exitSpy).toHaveBeenCalledTimes(1);
		});

		it('should execute full shutdown sequence with ngrok and cleanups successfully', async () => {
			(ENV as any).NGROK_AUTHTOKEN = 'token-123';
			await service.start(() => ({ fetch: vi.fn() }));

			const cleanupMock = vi.fn().mockResolvedValue(undefined);

			await service.handleShutdown('SIGINT', [cleanupMock]);

			expect(mockNgrokClose).toHaveBeenCalled();
			expect(cleanupMock).toHaveBeenCalled();
			expect(mockServerClose).toHaveBeenCalled();
			expect(exitSpy).toHaveBeenCalledWith(0);

			(ENV as any).NGROK_AUTHTOKEN = '';
		});

		it('should handle ngrok close error during shutdown gracefully', async () => {
			(ENV as any).NGROK_AUTHTOKEN = 'token-123';
			await service.start(() => ({ fetch: vi.fn() }));
			mockNgrokClose.mockRejectedValueOnce(new Error('Close error'));

			await service.handleShutdown('SIGTERM');

			expect(appLogger.error).toHaveBeenCalledWith(
				'Error closing ngrok tunnel:',
				expect.any(Error)
			);
			expect(exitSpy).toHaveBeenCalledWith(0);

			(ENV as any).NGROK_AUTHTOKEN = '';
		});

		it('should handle cleanup task errors during shutdown gracefully', async () => {
			const failingCleanup = vi
				.fn()
				.mockRejectedValue(new Error('Cleanup blew up'));

			await service.handleShutdown('SIGTERM', [failingCleanup]);

			expect(appLogger.error).toHaveBeenCalledWith(
				'Error during cleanup task:',
				expect.any(Error)
			);
			expect(exitSpy).toHaveBeenCalledWith(0);
		});

		it('should handle offline/ECONNREFUSED webhook error during shutdown', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			const connError: any = new Error('Refused');
			connError.code = 'ECONNREFUSED';
			(webhookDispatcher.broadcast as any).mockRejectedValueOnce(
				connError
			);

			await service.handleShutdown('SIGTERM');

			expect(appLogger.debug).toHaveBeenCalledWith(
				'Bot target endpoint was already offline.'
			);
			expect(exitSpy).toHaveBeenCalledWith(0);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});

		it('should handle general webhook warning during shutdown', async () => {
			(ENV as any).BOT_WEBHOOK_URL = 'https://bot.example.com';
			(ENV as any).BOT_WEBHOOK_SECRET = 'secret-abc';

			(webhookDispatcher.broadcast as any).mockRejectedValueOnce(
				new Error('Timeout')
			);

			await service.handleShutdown('SIGTERM');

			expect(appLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining(
					'Failed to dispatch offline webhook: Timeout'
				)
			);
			expect(exitSpy).toHaveBeenCalledWith(0);

			(ENV as any).BOT_WEBHOOK_URL = '';
			(ENV as any).BOT_WEBHOOK_SECRET = '';
		});

		it('should catch critical shutdown exceptions and exit with code 1', async () => {
			(serve as any).mockReturnValue({
				close: () => {
					throw new Error('Catastrophic failure');
				}
			});

			await service.start(() => ({ fetch: vi.fn() }));
			await service.handleShutdown('SIGTERM');

			expect(appLogger.error).toHaveBeenCalledWith(
				'Shutdown failed:',
				expect.any(Error)
			);
			expect(exitSpy).toHaveBeenCalledWith(1);
		});
	});

	it('should export a working singleton instance', () => {
		expect(lifecycleService).toBeInstanceOf(LifecycleService);
	});
});
