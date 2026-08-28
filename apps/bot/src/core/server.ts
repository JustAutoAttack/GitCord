import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { ENV } from '../config';
import { webhookRouter } from '../routes';

export const app = new Hono();

app.get('/', (c) => c.text('GitHub Discord Bot Engine is running!'));

// Mount routes under a /webhook prefix
app.route('/webhook', webhookRouter);

export function startServer() {
	console.log(`[Hono] Starting webhook server on port ${ENV.PORT}...`);
	serve({
		fetch: app.fetch,
		port: ENV.PORT
	});
}
