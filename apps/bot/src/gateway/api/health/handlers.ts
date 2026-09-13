import type { RouteHandler } from '@hono/zod-openapi';

import { HealthService } from '@services';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const livenessHandler: RouteHandler<typeof liveRoute> = (ctx) => {
	const result = HealthService.getLiveness();
	return ctx.json(result, 200);
};

export const readinessHandler: RouteHandler<typeof readyRoute> = (ctx) => {
	const result = HealthService.getReadiness();
	const statusCode = result.success ? 200 : 503;
	return ctx.json(result, statusCode);
};

export const fullHealthHandler: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	const result = HealthService.getHealthOverview();
	const statusCode = result.success ? 200 : 503;
	return ctx.json(result, statusCode);
};
