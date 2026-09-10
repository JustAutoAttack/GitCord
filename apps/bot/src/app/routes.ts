import { Hono } from 'hono';

import { appLogger } from '@core';
import { handleGitHubWebhook } from '@features/github';

export function registerRoutes(app: Hono): void {
	app.get('/', (c) => {
		appLogger.info(`GET ${c.req.path}`);

		return c.text('GitHub Discord Bot Engine is running!');
	});

	app.post('/webhook/github', handleGitHubWebhook);

	app.all('*', (c) => {
		appLogger.warn(`404 ${c.req.method} ${c.req.path}`);

		return c.text('Not Found', 404);
	});
}
