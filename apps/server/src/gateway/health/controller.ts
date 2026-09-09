import { RouteHandler } from '@hono/zod-openapi';

import { httpLogger } from '@core';
import { checkDbHealth } from '@database';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const getLiveness: RouteHandler<typeof liveRoute> = (ctx) => {
	httpLogger.debug('Liveness probe check requested.');
	return ctx.json(
		{
			success: true,
			message: 'Server process is responsive',
			timestamp: new Date().toISOString()
		},
		200
	);
};

export const getReadiness: RouteHandler<typeof readyRoute> = (ctx) => {
	httpLogger.debug('Readiness probe check requested.');
	const dbCheck = checkDbHealth();

	if (!dbCheck.success) {
		httpLogger.warn(
			`Readiness check failed: Database connection issue detected. Message: ${dbCheck.message}`
		);
	}

	return ctx.json(
		{
			success: dbCheck.success,
			message: dbCheck.success
				? 'Database connection is ready'
				: 'Database connection failed',
			checks: {
				database: dbCheck
			},
			timestamp: new Date().toISOString()
		},
		200
	);
};

export const getHealthOverview: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	httpLogger.debug('Full health overview requested.');
	const dbCheck = checkDbHealth();

	if (!dbCheck.success) {
		httpLogger.error(
			`System health degradation detected: Database failure during full health overview. Message: ${dbCheck.message}`
		);
	}

	return ctx.json(
		{
			success: dbCheck.success,
			message: dbCheck.success
				? 'System is fully operational'
				: 'System is degraded due to database failure',
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: new Date().toISOString(),
			checks: {
				database: dbCheck
			}
		},
		200
	);
};
