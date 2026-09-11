import { createMiddleware } from 'hono/factory';
import crypto from 'node:crypto';

import { asyncLocalStorageService } from '../services';
import { RequestContextData } from '../types';

export const requestContextMiddleware = createMiddleware(async (c, next) => {
	const serverRequestId = c.req.header('X-Request-ID') || crypto.randomUUID();
	const clientRequestId = c.req.header('X-Client-Request-ID');
	const userAgent = c.req.header('User-Agent');
	const forwardedFor = c.req.header('X-Forwarded-For');
	const ipAddress = forwardedFor
		? forwardedFor.split(',')[0]?.trim() || '127.0.0.1'
		: '127.0.0.1';

	const contextData: RequestContextData = {
		serverRequestId,
		clientRequestId,
		userAgent,
		ipAddress,
		timestamp: Date.now()
	};

	c.header('X-Request-ID', serverRequestId);

	return asyncLocalStorageService.run(contextData, async () => {
		await next();
	});
});
