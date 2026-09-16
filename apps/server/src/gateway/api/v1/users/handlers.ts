import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { usersService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByDiscordIDRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import { logger } from '../../logger';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	logger.debug('API Request: List users');

	const users = await usersService.list();
	logger.debug(`API Success: Returning ${users.length} users`);
	return ctx.json(users, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	logger.debug(`API Request: Get user by ID [${id}]`);

	const user = await usersService.getById(id);
	if (!user) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	return ctx.json(user, 200);
};

export const getByDiscordIDHandler: RouteHandler<
	typeof getByDiscordIDRoute
> = async (ctx) => {
	const { discordId } = ctx.req.valid('param');
	logger.debug(`API Request: Get user by Discord ID [${discordId}]`);

	const user = await usersService.getByDiscordId(discordId);
	if (!user) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	return ctx.json(user, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	logger.info(
		`API Request: Create user for Discord ID [${body.discordId}]`
	);

	const newUser = await usersService.create({
		discordId: body.discordId,
		displayName: body.displayName,
		avatarUrl: body.avatarUrl
	});

	logger.info(`API Success: Created user [ID: ${newUser.id}]`);
	return ctx.json(newUser, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	logger.info(`API Request: Update user [ID: ${id}]`);

	const updatedUser = await usersService.update(id, {
		displayName: body.displayName,
		avatarUrl: body.avatarUrl
	});

	if (!updatedUser) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	logger.info(`API Success: Updated user [ID: ${id}]`);
	return ctx.json(updatedUser, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.info(`API Request: Delete user [ID: ${id}]`);

	const deleted = await usersService.delete(id);
	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	logger.info(`API Success: Deleted user [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'User deleted successfully'
		},
		200
	);
};
