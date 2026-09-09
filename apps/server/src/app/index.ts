import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';

import { AppError, ErrorCode, Responses, appLogger, httpLogger } from '@core';
import { healthRouter, apiRouter } from '@gateway';
import { openAPIConfig } from './openapi';

export function createApp(): OpenAPIHono {
	const app = new OpenAPIHono();

	appLogger.info('Initializing application core and middleware layers...');

	// Middleware: Custom HTTP Request Logger wrapping our httpLogger
	app.use('*', async (ctx, next) => {
		const start = performance.now();
		const { method, path } = ctx.req;

		httpLogger.info(`Incoming request: ${method} ${path}`);

		await next();

		const durationMs = Number((performance.now() - start).toFixed(2));
		const status = ctx.res.status;

		if (status >= 500) {
			httpLogger.error(
				`Request failed: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		} else if (status >= 400) {
			httpLogger.warn(
				`Request client error: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		} else {
			httpLogger.info(
				`Request completed: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		}
	});

	app.use('*', cors());

	app.onError((error, ctx) => {
		if (error instanceof AppError) {
			return ctx.json(
				Responses.error(error.code, error.message),
				error.statusCode
			);
		}

		const message =
			error instanceof Error ? error.message : 'Internal Server Error';
		appLogger.error(
			`CRITICAL: Unhandled exception caught in global error boundary: ${message}`
		);
		return ctx.json(
			Responses.error(ErrorCode.INTERNAL_ERROR, message),
			500
		);
	});

	// Routes
	app.route('/health', healthRouter);
	app.route('/api', apiRouter);

	// OpenAPI v3.0 Specification Endpoint
	app.doc('/doc', openAPIConfig);

	// Interactive Swagger UI
	app.get('/swagger', swaggerUI({ url: '/doc' }));

	appLogger.info('Application setup completed successfully. Ready to bind.');

	return app;
}
