import { createMiddleware } from 'hono/factory';

import { asyncLocalStorageService, jwtService } from '../services';

import { AppError, ErrorCode } from '../errors';

import { userSessionsService } from '../../services/user-sessions';

export const requireAuth = createMiddleware(async (c, next) => {
	// Auth Bearer
	const authHeader = c.req.header('Authorization');

	if (!authHeader?.startsWith('Bearer ')) {
		throw new AppError(
			ErrorCode.UNAUTHORIZED,
			'Authentication token required'
		);
	}

	// Auth Token
	const token = authHeader.slice('Bearer '.length).trim();

	if (!token) {
		throw new AppError(
			ErrorCode.UNAUTHORIZED,
			'Authentication token required'
		);
	}

	const payload = jwtService.verify(token);

	if (!payload?.sub) {
		throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token');
	}

	// User Session
	const session = await userSessionsService.getByUserId(payload.sub);

	if (
		!session ||
		session.userId !== payload.sub ||
		session.accessToken !== token ||
		new Date(session.expiresAt).getTime() <= Date.now() ||
		session.revokedAt !== null
	) {
		throw new AppError(
			ErrorCode.UNAUTHORIZED,
			'Invalid or expired authentication session'
		);
	}

	// Async Storage
	asyncLocalStorageService.updateStore((store) => {
		store.auth = {
			userId: payload.sub,
			roles: []
		};
	});

	await next();
});
