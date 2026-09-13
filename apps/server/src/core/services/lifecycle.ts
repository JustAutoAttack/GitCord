import { serve, type ServerType } from '@hono/node-server';
import { forward } from '@ngrok/ngrok';

import { ENV } from '../env';
import { appLogger } from '../loggers';
import type { ServerLifecyclePayload } from '../types';
import { webhookDispatcher } from './webhook-dispatcher';

export class LifecycleService {
	private isShuttingDown = false;
	private server: ServerType | null = null;
	private ngrokListener: any = null;

	async start(appFactory: () => any, migrationFn: () => void): Promise<void> {
		appLogger.info('Starting GitCord server initialization sequence...');

		migrationFn();

		const app = appFactory();

		const port = ENV.PORT;

		this.server = serve({
			fetch: app.fetch,
			port
		});

		appLogger.info(`GitCord server is up and running on ${ENV.BASE_URL}`);
		appLogger.info(`Swagger UI available at ${ENV.BASE_URL}/swagger`);
		appLogger.info(`OpenAPI Spec available at ${ENV.BASE_URL}/doc`);

		if (ENV.NGROK_AUTHTOKEN) {
			try {
				this.ngrokListener = await forward({
					addr: port,
					authtoken: ENV.NGROK_AUTHTOKEN,
					domain: ENV.NGROK_URL
						? new URL(ENV.NGROK_URL).hostname
						: undefined
				});
				const ngrokUrl = this.ngrokListener.url();
				appLogger.info(
					`[ngrok] Tunnel established successfully at: ${ngrokUrl}`
				);
			} catch (error) {
				appLogger.error('[ngrok] Failed to establish tunnel:', error);
			}
		}

		if (ENV.BOT_WEBHOOK_URL && ENV.BOT_WEBHOOK_SECRET) {
			const lifecycleUrl = new URL(
				'/lifecycle',
				ENV.BOT_WEBHOOK_URL
			).toString();
			const payload: ServerLifecyclePayload = {
				timestamp: Date.now(),
				data: {
					status: 'ONLINE',
					reason: 'Server startup complete'
				}
			};
			try {
				await webhookDispatcher.broadcast(
					lifecycleUrl,
					ENV.BOT_WEBHOOK_SECRET,
					payload
				);
			} catch (error: any) {
				if (
					error?.cause?.code === 'ECONNREFUSED' ||
					error?.code === 'ECONNREFUSED'
				) {
					appLogger.info(
						'Bot target endpoint was offline during startup notification.'
					);
				} else {
					appLogger.warn(
						`Failed to dispatch online webhook: ${error instanceof Error ? error.message : String(error)}`
					);
				}
			}
		}
	}

	async handleShutdown(
		signal: string,
		additionalCleanups?: (() => Promise<void> | void)[]
	): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}
		this.isShuttingDown = true;

		appLogger.info(`Received ${signal}. Shutting down GitCord server...`);

		try {
			if (ENV.BOT_WEBHOOK_URL && ENV.BOT_WEBHOOK_SECRET) {
				const lifecycleUrl = new URL(
					'/lifecycle',
					ENV.BOT_WEBHOOK_URL
				).toString();
				const payload: ServerLifecyclePayload = {
					timestamp: Date.now(),
					data: {
						status: 'OFFLINE',
						reason: `Process received ${signal}`
					}
				};
				try {
					await webhookDispatcher.broadcast(
						lifecycleUrl,
						ENV.BOT_WEBHOOK_SECRET,
						payload
					);
				} catch (error: any) {
					if (
						error?.cause?.code === 'ECONNREFUSED' ||
						error?.code === 'ECONNREFUSED'
					) {
						appLogger.info(
							'Bot target endpoint was already offline.'
						);
					} else {
						appLogger.warn(
							`Failed to dispatch offline webhook: ${error instanceof Error ? error.message : String(error)}`
						);
					}
				}
			}

			if (
				this.ngrokListener &&
				typeof this.ngrokListener.close === 'function'
			) {
				try {
					await this.ngrokListener.close();
					appLogger.info('[ngrok] Tunnel closed successfully.');
				} catch (ngrokError) {
					appLogger.error('Error closing ngrok tunnel:', ngrokError);
				}
			}

			if (additionalCleanups && additionalCleanups.length > 0) {
				for (const cleanup of additionalCleanups) {
					try {
						await cleanup();
					} catch (cleanupError) {
						appLogger.error(
							'Error during cleanup task:',
							cleanupError
						);
					}
				}
			}

			if (
				this.server &&
				typeof (this.server as any).close === 'function'
			) {
				await new Promise<void>((resolve) => {
					(this.server as any).close(() => {
						appLogger.info('HTTP server closed successfully.');
						resolve();
					});
				});
			}

			appLogger.info('GitCord server shutdown completed successfully.');
			process.exit(0);
		} catch (error) {
			appLogger.error('Shutdown failed:', error);
			process.exit(1);
		}
	}
}

export const lifecycleService = new LifecycleService();
