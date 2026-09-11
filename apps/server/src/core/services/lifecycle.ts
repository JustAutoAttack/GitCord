import { serve, type ServerType } from '@hono/node-server';
import { ENV } from '../env';
import { appLogger } from '../loggers';
import { webhookDispatcher } from './webhook-dispatcher';

export class LifecycleService {
	private isShuttingDown = false;
	private server: ServerType | null = null;

	async start(appFactory: () => any, migrationFn: () => void): Promise<void> {
		appLogger.info('Starting GitCord server initialization sequence...');

		migrationFn();

		const app = appFactory();

		const url = new URL(ENV.BASE_URL);
		const port = url.port
			? parseInt(url.port, 10)
			: url.protocol === 'https:'
				? 443
				: 80;

		this.server = serve({
			fetch: app.fetch,
			port
		});

		appLogger.info(`GitCord server is up and running on ${ENV.BASE_URL}`);
		appLogger.info(`Swagger UI available at ${ENV.BASE_URL}/swagger`);
		appLogger.info(`OpenAPI Spec available at ${ENV.BASE_URL}/doc`);

		if (ENV.BOT_WEBHOOK_URL && ENV.BOT_WEBHOOK_SECRET) {
			try {
				await webhookDispatcher.broadcast(
					ENV.BOT_WEBHOOK_URL,
					ENV.BOT_WEBHOOK_SECRET,
					{
						type: 'SERVER_LIFECYCLE',
						timestamp: Date.now(),
						data: {
							status: 'ONLINE',
							reason: 'Server startup complete'
						}
					}
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
				try {
					await webhookDispatcher.broadcast(
						ENV.BOT_WEBHOOK_URL,
						ENV.BOT_WEBHOOK_SECRET,
						{
							type: 'SERVER_LIFECYCLE',
							timestamp: Date.now(),
							data: {
								status: 'OFFLINE',
								reason: `Process received ${signal}`
							}
						}
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
