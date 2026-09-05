import { RouteHandler } from '@hono/zod-openapi';

import { checkDbHealth } from '@database';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const getLiveness: RouteHandler<typeof liveRoute> = (ctx) => {
	return ctx.json(
		{
			status: 'UP',
			timestamp: new Date().toISOString()
		},
		200
	);
};

export const getReadiness: RouteHandler<typeof readyRoute> = (ctx) => {
	const dbCheck = checkDbHealth();
	const isReady = dbCheck.status === 'up';

	return ctx.json(
		{
			status: isReady ? 'UP' : 'DOWN',
			checks: {
				database: dbCheck
			},
			timestamp: new Date().toISOString()
		},
		isReady ? 200 : 503
	);
};

export const getHealthOverview: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	const dbCheck = checkDbHealth();
	const isHealthy = dbCheck.status === 'up';

	return ctx.json(
		{
			status: isHealthy ? 'HEALTHY' : 'DEGRADED',
			uptimeSeconds: Math.floor(process.uptime()),
			timestamp: new Date().toISOString(),
			checks: {
				database: dbCheck
			}
		},
		isHealthy ? 200 : 503
	);
};
