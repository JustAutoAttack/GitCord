import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { userSessionsService } from '@services';
import {
	createUserSessionRoute,
	deleteUserSessionRoute,
	getUserSessionByIdRoute,
	getUserSessionByUserIdRoute,
	listUserSessionsRoute,
	updateUserSessionRoute
} from './routes';

export const handleListUserSessions: RouteHandler<
	typeof listUserSessionsRoute
> = async (ctx) => {
	httpLogger.debug('API Request: List user sessions');

	const sessions = await userSessionsService.list();
	httpLogger.debug(
		`API Success: Returning ${sessions.length} user session(s)`
	);
	return ctx.json(sessions, 200);
};

export const handleGetUserSessionById: RouteHandler<
	typeof getUserSessionByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get user session by ID [${id}]`);

	const session = await userSessionsService.getById(id);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	return ctx.json(session, 200);
};

export const handleGetUserSessionByUserId: RouteHandler<
	typeof getUserSessionByUserIdRoute
> = async (ctx) => {
	const { userId } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get user session by user ID [${userId}]`);

	const session = await userSessionsService.getByUserId(userId);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	return ctx.json(session, 200);
};

export const handleCreateUserSession: RouteHandler<
	typeof createUserSessionRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create user session for user [${body.userId}]`
	);

	const newSession = await userSessionsService.create({
		userId: body.userId,
		accessTokenEncrypted: body.accessTokenEncrypted,
		refreshTokenEncrypted: body.refreshTokenEncrypted,
		expiresAt: body.expiresAt
	});

	httpLogger.info(`API Success: Created user session [ID: ${newSession.id}]`);
	return ctx.json(newSession, 201);
};

export const handleUpdateUserSession: RouteHandler<
	typeof updateUserSessionRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update user session [ID: ${id}]`);

	const updatedSession = await userSessionsService.update(id, {
		userId: body.userId,
		accessTokenEncrypted: body.accessTokenEncrypted,
		refreshTokenEncrypted: body.refreshTokenEncrypted,
		expiresAt: body.expiresAt
	});

	if (!updatedSession) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	httpLogger.info(`API Success: Updated user session [ID: ${id}]`);
	return ctx.json(updatedSession, 200);
};

export const handleDeleteUserSession: RouteHandler<
	typeof deleteUserSessionRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete user session [ID: ${id}]`);

	const deleted = await userSessionsService.delete(id);
	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	httpLogger.info(`API Success: Deleted user session [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'User session deleted successfully'
		},
		200
	);
};
