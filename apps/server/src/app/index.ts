import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import { appLogger, httpLoggerMiddleware, errorHandlerMiddleware } from '@core';
import { healthRouter, apiRouter } from '@gateway';
import { openAPIConfig } from './openapi';

export function createApp(): OpenAPIHono {
	const app = new OpenAPIHono();

	appLogger.info('Initializing application core and middleware layers...');

	// Middleware
	app.use('*', httpLoggerMiddleware());
	app.use('*', cors());
	// TODO Use auth context middleware
	app.onError(errorHandlerMiddleware());

	// Routes
	app.route('/health', healthRouter);
	app.route('/api', apiRouter);

	// OpenAPI
	app.doc('/doc', openAPIConfig);

	// Swagger UI
	app.get('/swagger', swaggerUI({ url: '/doc' }));

	appLogger.info('Application setup completed successfully. Ready to bind.');

	return app;
}
