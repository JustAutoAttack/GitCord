import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import { appLogger, errorHandlerMiddleware, httpLoggerMiddleware } from '@core';
import { healthRouter, webhooksRouter } from '@gateway';
import { openAPIConfig } from './openapi';

export function createApp(): OpenAPIHono {
	const app = new OpenAPIHono();

	appLogger.info(
		'Initializing application core and middleware layers for bot...'
	);

	app.use('*', httpLoggerMiddleware());
	app.use('*', cors());
	app.onError(errorHandlerMiddleware());

	// Routes
	app.route('/health', healthRouter);
	app.route('/webhooks', webhooksRouter);

	// OpenAPI
	app.doc('/doc', openAPIConfig);

	// Swagger UI
	app.get('/swagger', swaggerUI({ url: '/doc' }));

	appLogger.info('Bot application setup completed successfully.');

	return app;
}
