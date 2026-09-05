import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

import { responseMiddleware } from '@core';
import { healthRouter, apiRouter } from '../gateway';
import { openAPIConfig } from './openapi';

export function createApp(): OpenAPIHono {
	const app = new OpenAPIHono();

	// Middleware
	app.use('*', logger());
	app.use('*', cors());
	app.use('*', responseMiddleware);

	// Routes
	app.route('/health', healthRouter);
	app.route('/api', apiRouter);

	// OpenAPI v3.0 Specification Endpoint
	app.doc('/doc', openAPIConfig);

	// Interactive Swagger UI
	app.get('/swagger', swaggerUI({ url: '/doc' }));

	return app;
}
