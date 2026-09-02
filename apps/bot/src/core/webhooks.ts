import { serve, type ServerType } from '@hono/node-server';
import ngrok, { type Listener } from '@ngrok/ngrok';
import { Hono } from 'hono';

import { ENV } from './env';
import { logger } from './logger';

export const app = new Hono();

let server: ServerType | null = null;
let tunnel: Listener | null = null;

app.get('/', (c) => {
	return c.text('GitHub Discord Bot Engine is running!');
});

export function registerWebhookRouter(router: Hono): void {
	app.route('/webhook', router);
}

export function startWebhookServer(): void {
	if (server) {
		logger.warn('Webhook server is already running.');
		return;
	}

	logger.info(`Starting GitHub webhook listener on port ${ENV.PORT}...`);

	server = serve({
		fetch: app.fetch,
		port: ENV.PORT
	});

	logger.info(
		`GitHub webhook listener is running on http://localhost:${ENV.PORT}`
	);
}

export async function exposeWebhookServer(): Promise<void> {
	if (tunnel) {
		logger.warn('Public webhook tunnel is already running.');
		return;
	}

	logger.info('Creating public webhook tunnel...');

	try {
		tunnel = await ngrok.forward({
			addr: ENV.PORT,
			authtoken: ENV.NGROK_AUTHTOKEN
		});

		const publicUrl = tunnel.url();

		if (!publicUrl) {
			tunnel = null;
			throw new Error('ngrok did not return a public URL');
		}

		logger.info(`Public webhook tunnel active: ${publicUrl}`);
		logger.info(`GitHub webhook endpoint: ${publicUrl}/webhook/github`);
	} catch (error) {
		tunnel = null;

		logger.error('Failed to create public webhook tunnel:', error);

		throw error;
	}
}

export async function stopWebhookServer(): Promise<void> {
	if (tunnel) {
		try {
			await tunnel.close();
			logger.info('Public webhook tunnel closed.');
		} catch (error) {
			logger.error('Failed to close public webhook tunnel:', error);
		} finally {
			tunnel = null;
		}
	}

	if (server) {
		server.close();
		server = null;

		logger.info('Webhook server stopped.');
	}
}
