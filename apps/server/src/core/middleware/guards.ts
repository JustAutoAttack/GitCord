import { createMiddleware } from 'hono/factory';

import { AppError, ErrorCode, ENV, jwtService, cryptoService } from '@core';
import { asyncLocalStorageService } from '../services';

export const requireAuth = createMiddleware(async (c, next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		throw new AppError(
			ErrorCode.UNAUTHORIZED,
			'Authentication token required'
		);
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		throw new AppError(
			ErrorCode.UNAUTHORIZED,
			'Authentication token required'
		);
	}

	const payload = jwtService.verify(token);

	if (!payload) {
		throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token');
	}

	asyncLocalStorageService.updateStore((store) => {
		store.auth = {
			userId: payload.sub,
			roles: []
		};
	});

	await next();
});

