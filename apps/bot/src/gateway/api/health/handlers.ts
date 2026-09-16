import type { RouteHandler } from '@hono/zod-openapi';

import { HealthService } from '@services';
import { logger } from '../logger';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const livenessHandler: RouteHandler<typeof liveRoute> = (ctx) => {
	const result = HealthService.getLiveness();
	logger.debug('Liveness check requested, status: `healthy`');
	return ctx.json(result, 200);
};

export const readinessHandler: RouteHandler<typeof readyRoute> = (ctx) => {
	const result = HealthService.getReadiness();
	const statusCode = result.success ? 200 : 503;

	if (result.success) {
		logger.info('Readiness check passed: `ready`');
	} else {
		logger.warn('Readiness check failed: `not ready`');
	}

	return ctx.json(result, statusCode);
};

export const fullHealthHandler: RouteHandler<typeof fullHealthRoute> = (
	ctx
) => {
	const result = HealthService.getHealthOverview();
	const statusCode = result.success ? 200 : 503;

	if (result.success) {
		logger.info('Full health overview fetched successfully: `status 200`');
	} else {
		logger.warn('Full health overview reported degradation: `status 503`');
	}

	return ctx.json(result, statusCode);
};
