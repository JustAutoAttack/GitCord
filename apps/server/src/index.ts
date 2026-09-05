import { serve } from '@hono/node-server';

import { createApp } from './app';
import { migrateDatabase } from './database';
import { ENV } from './core';

try {
	migrateDatabase();

	const app = createApp();

	serve({
		fetch: app.fetch,
		port: Number(ENV.PORT)
	});

	const baseUrl = `http://localhost:${ENV.PORT}`;

	console.log(`GitCord server running on ${baseUrl}`);
	console.log(`Swagger UI available at ${baseUrl}/swagger`);
	console.log(`OpenAPI Spec available at ${baseUrl}/doc`);
} catch (error) {
	console.error(
		`Error starting GitCord server on http://localhost:${ENV.PORT}:`,
		error
	);

	process.exit(1);
}
