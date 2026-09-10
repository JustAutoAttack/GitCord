import type { MiddlewareHandler } from 'hono';
import { httpLogger } from '../loggers';

export const httpLoggerMiddleware = (): MiddlewareHandler => {
	return async (ctx, next) => {
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
	};
};
