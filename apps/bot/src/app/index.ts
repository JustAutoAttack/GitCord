import { serve, type ServerType } from '@hono/node-server';
import ngrok, { type Listener } from '@ngrok/ngrok';
import { Hono } from 'hono';

import { ENV, appLogger } from '@core';
import { registerRoutes } from './routes';

export const app = new Hono();

registerRoutes(app);

let server: ServerType | null = null;
let tunnel: Listener | null = null;

export function startWebhookServer(): void {
	if (server) {
		appLogger.warn('Webhook server is already running.');
		return;
	}

	appLogger.info(`Starting GitHub webhook listener on port ${ENV.PORT}...`);

	server = serve({
		fetch: app.fetch,
		port: ENV.PORT
	});

	appLogger.info(
		`GitHub webhook listener is running on http://localhost:${ENV.PORT}`
	);
}

export async function exposeWebhookServer(): Promise<void> {
	if (tunnel) {
		appLogger.warn('Public webhook tunnel is already running.');
		return;
	}

	appLogger.info('Creating public webhook tunnel...');

	try {
		tunnel = await ngrok.forward({
			addr: `http://localhost:${ENV.PORT}`,
			authtoken: ENV.NGROK_AUTHTOKEN
		});

		const publicUrl = tunnel.url();

		if (!publicUrl) {
			await tunnel.close().catch(() => undefined);
			tunnel = null;

			throw new Error('ngrok did not return a public URL.');
		}

		appLogger.info(`Public webhook tunnel active: ${publicUrl}`);
		appLogger.info(`GitHub webhook endpoint: ${publicUrl}/webhook/github`);
	} catch (error) {
		tunnel = null;

		appLogger.error('Failed to create public webhook tunnel:', error);

		throw error;
	}
}

export async function stopWebhookServer(): Promise<void> {
	if (tunnel) {
		const activeTunnel = tunnel;
		tunnel = null;

		try {
			await activeTunnel.close();
			appLogger.info('Public webhook tunnel closed.');
		} catch (error) {
			appLogger.error('Failed to close public webhook tunnel:', error);
		}
	}

	if (server) {
		const activeServer = server;
		server = null;

		try {
			activeServer.close();
			appLogger.info('Webhook server stopped.');
		} catch (error) {
			appLogger.error('Failed to stop webhook server:', error);
		}
	}
}
