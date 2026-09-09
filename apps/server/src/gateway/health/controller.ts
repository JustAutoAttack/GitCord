import { RouteHandler } from '@hono/zod-openapi';
import { checkDbHealth } from '@database';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const getLiveness: RouteHandler<typeof liveRoute> = (ctx) => {
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
	const dbCheck = checkDbHealth();

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
	const dbCheck = checkDbHealth();

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
