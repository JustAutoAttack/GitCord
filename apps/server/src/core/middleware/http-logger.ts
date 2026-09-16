import type { MiddlewareHandler } from 'hono';
import { appLogger } from '../loggers';

export const httpLoggerMiddleware = (): MiddlewareHandler => {
	return async (ctx, next) => {
		const start = performance.now();
		const { method, path } = ctx.req;

		appLogger.info(`Incoming request: ${method} ${path}`);

		await next();

		const durationMs = Number((performance.now() - start).toFixed(2));
		const status = ctx.res.status;

		if (status >= 500) {
			appLogger.error(
				`Request failed: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		} else if (status >= 400) {
			appLogger.warn(
				`Request client error: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		} else {
			appLogger.info(
				`Request completed: ${method} ${path} - Status: ${status} - Duration: ${durationMs}ms`
			);
		}
	};
};
