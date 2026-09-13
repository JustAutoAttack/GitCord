import type { RouteHandler } from '@hono/zod-openapi';

import { healthService } from '@services';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const livenessHandler: RouteHandler<typeof liveRoute> = (ctx) => {
	const result = healthService.getLiveness();
	return ctx.json(result, 200);
};

export const readinessHandler: RouteHandler<typeof readyRoute> = (ctx) => {
	const result = healthService.getReadiness();
	const statusCode = result.success ? 200 : 503;
	return ctx.json(result, statusCode);
};

export const fullHealthHandler: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	const result = healthService.getHealthOverview();
	const statusCode = result.success ? 200 : 503;
	return ctx.json(result, statusCode);
};
