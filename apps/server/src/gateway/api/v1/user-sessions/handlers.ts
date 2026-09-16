import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { userSessionsService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByIDRoute,
	getByUserIdRoute,
	listRoute,
	updateRoute
} from './routes';
import { logger } from '../../logger';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	logger.debug('API Request: List user sessions');

	const sessions = await userSessionsService.list();
	logger.debug(
		`API Success: Returning ${sessions.length} user session(s)`
	);
	return ctx.json(sessions, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.debug(`API Request: Get user session by ID [${id}]`);

	const session = await userSessionsService.getById(id);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	return ctx.json(session, 200);
};

export const getByUserIdHandler: RouteHandler<typeof getByUserIdRoute> = async (
	ctx
) => {
	const { userId } = ctx.req.valid('param');
	logger.debug(`API Request: Get user session by user ID [${userId}]`);

	const session = await userSessionsService.getByUserId(userId);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	return ctx.json(session, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	logger.info(
		`API Request: Create user session for user [${body.userId}]`
	);

	const newSession = await userSessionsService.create({
		userId: body.userId,
		accessTokenEncrypted: body.accessTokenEncrypted,
		refreshTokenEncrypted: body.refreshTokenEncrypted,
		expiresAt: body.expiresAt
	});

	logger.info(`API Success: Created user session [ID: ${newSession.id}]`);
	return ctx.json(newSession, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	logger.info(`API Request: Update user session [ID: ${id}]`);

	const updatedSession = await userSessionsService.update(id, {
		userId: body.userId,
		accessTokenEncrypted: body.accessTokenEncrypted,
		refreshTokenEncrypted: body.refreshTokenEncrypted,
		expiresAt: body.expiresAt
	});

	if (!updatedSession) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	logger.info(`API Success: Updated user session [ID: ${id}]`);
	return ctx.json(updatedSession, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.info(`API Request: Delete user session [ID: ${id}]`);

	const deleted = await userSessionsService.delete(id);
	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
	}

	logger.info(`API Success: Deleted user session [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'User session deleted successfully'
		},
		200
	);
};
