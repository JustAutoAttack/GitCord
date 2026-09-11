import { serve, type ServerType } from '@hono/node-server';
import ngrok, { type Listener } from '@ngrok/ngrok';

import { ENV, appLogger } from '@core';

export class LifecycleService {
	private isShuttingDown = false;
	private server: ServerType | null = null;
	private tunnel: Listener | null = null;

	async start(
		appFactory: () => any,
		connectDiscordFn: () => Promise<void>
	): Promise<void> {
		appLogger.info('Starting GitCord Bot initialization sequence...');

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

		appLogger.info(`Bot webhook server is running on ${ENV.BASE_URL}`);
		appLogger.info(`Swagger UI available at ${ENV.BASE_URL}/swagger`);
		appLogger.info(`OpenAPI Spec available at ${ENV.BASE_URL}/doc`);

		if (ENV.NGROK_AUTHTOKEN) {
			appLogger.info('Creating public webhook tunnel...');
			this.tunnel = await ngrok.forward({
				addr: port,
				authtoken: ENV.NGROK_AUTHTOKEN
			});
			const publicUrl = this.tunnel.url();
			appLogger.info(`Public webhook tunnel active: ${publicUrl}`);
			appLogger.info(
				`Server event receiver endpoint: ${publicUrl}/webhook/server`
			);
			appLogger.info(
				`GitHub event receiver endpoint: ${publicUrl}/webhook/github`
			);
		}

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

		appLogger.info(`Received ${signal}. Shutting down GitCord...`);

		try {
			if (this.tunnel) {
				await this.tunnel.close();
				appLogger.info('Public webhook tunnel closed.');
			}

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
