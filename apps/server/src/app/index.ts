import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import {
	appLogger,
	httpLoggerMiddleware,
	errorHandlerMiddleware,
	requestContextMiddleware
} from '@core';
import { gatewayRouter } from '@gateway';
import { openAPIConfig } from './openapi';

export function createApp(): OpenAPIHono {
	appLogger.info('Creating application instance...');

	const app = new OpenAPIHono();

	// Register global middleware pipeline
	appLogger.info('Configuring middleware...');
	app.use('*', httpLoggerMiddleware());
	app.use('*', cors());
	app.use('*', requestContextMiddleware);
	app.onError(errorHandlerMiddleware());

	// Register application route groups
	appLogger.info('Mounting route handlers...');
	app.route('/', gatewayRouter);

	// Register OpenAPI specification and interactive documentation UI
	appLogger.info('Configuring API documentation...');
	app.doc('/doc', openAPIConfig);
	app.get('/swagger', swaggerUI({ url: '/doc' }));

	appLogger.info('Application setup completed successfully.');

	return app;
}
