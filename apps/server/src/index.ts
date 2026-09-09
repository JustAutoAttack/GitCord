import { serve } from '@hono/node-server';

import { createApp } from './app';
import { migrateDatabase } from './database';
import { ENV, appLogger } from './core';

try {
	appLogger.info('Starting GitCord server initialization sequence...');

	migrateDatabase();

	const app = createApp();

	const port = Number(ENV.PORT);
	serve({
		fetch: app.fetch,
		port
	});

	const baseUrl = `http://localhost:${port}`;

	appLogger.info(`GitCord server is up and running on ${baseUrl}`);
	appLogger.info(`Swagger UI available at ${baseUrl}/swagger`);
	appLogger.info(`OpenAPI Spec available at ${baseUrl}/doc`);
} catch (error) {
	const errorMsg = error instanceof Error ? error.message : String(error);
	appLogger.error(
		`CRITICAL: Failed to start GitCord server on http://localhost:${ENV.PORT}. Error: ${errorMsg}`
	);

	process.exit(1);
}
