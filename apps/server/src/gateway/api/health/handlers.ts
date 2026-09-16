import { RouteHandler } from '@hono/zod-openapi';

import { healthService } from '@services';
import { logger } from '../logger';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const liveHandler: RouteHandler<typeof liveRoute> = (ctx) => {
	logger.debug('Executing liveness probe check');
	const result = healthService.getLiveness();
	return ctx.json(result, 200);
};

export const readyHandler: RouteHandler<typeof readyRoute> = (ctx) => {
	logger.debug('Executing readiness probe check');
	const result = healthService.getReadiness();
	const statusCode = result.success ? 200 : 503;

	if (!result.success) {
		logger.warn('Readiness probe failed', { message: result.message });
	}

	return ctx.json(result, statusCode);
};

export const fullHealthHandler: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	logger.debug('Executing full diagnostic health check');
	const result = healthService.getHealthOverview();
	const statusCode = result.success ? 200 : 503;

	if (!result.success) {
		logger.warn('Full health check reported degraded status', {
			message: result.message
		});
	}

	return ctx.json(result, statusCode);
};
