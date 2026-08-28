import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import ngrok from '@ngrok/ngrok';

import { ENV } from '../config';
import { webhookRouter } from '../routes';

export const app = new Hono();

app.get('/', (c) => c.text('GitHub Discord Bot Engine is running!'));

// Mount routes under a /webhook prefix
app.route('/webhook', webhookRouter);

export async function startServer() {
	console.log(`[Hono] Starting webhook server on port ${ENV.PORT}...`);

	serve({
		fetch: app.fetch,
		port: ENV.PORT
	});

	try {
		// Programmatically spin up the tunnel bound to your local port
		const listener = await ngrok.forward({
			addr: ENV.PORT,
			authtoken_from_env: true
		});

		const publicUrl = listener.url();
		console.log(`[Ngrok] Tunnel active! Public URL: ${publicUrl}`);
		console.log(
			`[Ngrok] Set your GitHub webhook URL to: ${publicUrl}/webhook/github`
		);
	} catch (error) {
		console.error('[Ngrok] Failed to start tunnel:', error);
	}
}
