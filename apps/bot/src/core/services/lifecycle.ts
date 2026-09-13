import { serve, type ServerType } from '@hono/node-server';

import { ENV, appLogger } from '@core';

export class LifecycleService {
	private isShuttingDown = false;
	private server: ServerType | null = null;

	async start(
		appFactory: () => any,
		connectDiscordFn: () => Promise<void>
	): Promise<void> {
		appLogger.info('Starting GitCord Bot initialization sequence...');

		const app = appFactory();

		const url = new URL(ENV.BASE_URL);
		const port = url.port ? parseInt(url.port, 10) : ENV.PORT;

		this.server = serve({
			fetch: app.fetch,
			port
		});

		const displayUrl = url.port ? ENV.BASE_URL : `${ENV.BASE_URL}:${port}`;

		appLogger.info(`Bot webhook server is running on ${displayUrl}`);
		appLogger.info(`Swagger UI available at ${displayUrl}/swagger`);
		appLogger.info(`OpenAPI Spec available at ${displayUrl}/doc`);

		await connectDiscordFn();

		appLogger.info('GitCord startup completed successfully.');
	}

	async handleShutdown(
		signal: string,
		disconnectDiscordFn: (signal: string) => Promise<void>
	): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}
		this.isShuttingDown = true;

		appLogger.warn(`Received ${signal}. Shutting down GitCord...`);

		try {
			if (
				this.server &&
				typeof (this.server as any).close === 'function'
			) {
				await new Promise<void>((resolve) => {
					(this.server as any).close(() => {
						appLogger.info(
							'Webhook HTTP server closed successfully.'
						);
						resolve();
					});
				});
			}

			await disconnectDiscordFn(signal);
			appLogger.info('GitCord shutdown completed successfully.');
			process.exit(0);
		} catch (error) {
			appLogger.error('Shutdown failed:', error);
			process.exit(1);
		}
	}
}

export const lifecycleService = new LifecycleService();
