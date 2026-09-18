import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { discordSessionsService } from '@services';
import {
	deleteRoute,
	getByIDRoute,
	getByUserIdRoute,
	listRoute,
} from './routes';
import { logger } from '../../logger';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	logger.debug('API Request: List discord sessions');

	const sessions = await discordSessionsService.list();
	logger.debug(
		`API Success: Returning ${sessions.length} discord session(s)`
	);
	return ctx.json(sessions, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	logger.debug(`API Request: Get discord session by ID [${id}]`);

	const session = await discordSessionsService.getById(id);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Discord session not found');
	}

	return ctx.json(session, 200);
};

export const getByUserIdHandler: RouteHandler<typeof getByUserIdRoute> = async (
	ctx
) => {
	const { userId } = ctx.req.valid('param');
	logger.debug(`API Request: Get discord session by user ID [${userId}]`);

	const session = await discordSessionsService.getByUserId(userId);
	if (!session) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Discord session not found');
	}

	return ctx.json(session, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.info(`API Request: Delete discord session [ID: ${id}]`);

	const deleted = await discordSessionsService.delete(id);
	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Discord session not found');
	}

	logger.info(`API Success: Deleted discord session [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Discord session deleted successfully'
		},
		200
	);
};
