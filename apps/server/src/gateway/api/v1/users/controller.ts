import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { usersService } from '@services';
import {
	createUserRoute,
	deleteUserRoute,
	getUserByDiscordIdRoute,
	getUserByIdRoute,
	listUsersRoute,
	updateUserRoute
} from './routes';

export const handleListUsers: RouteHandler<typeof listUsersRoute> = async (
	ctx
) => {
	httpLogger.debug('API Request: List users');

	const users = await usersService.list();
	httpLogger.debug(`API Success: Returning ${users.length} users`);
	return ctx.json(users, 200);
};

export const handleGetUserById: RouteHandler<typeof getUserByIdRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get user by ID [${id}]`);

	const user = await usersService.getById(id);
	if (!user) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	return ctx.json(user, 200);
};

export const handleGetUserByDiscordId: RouteHandler<
	typeof getUserByDiscordIdRoute
> = async (ctx) => {
	const { discordId } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get user by Discord ID [${discordId}]`);

	const user = await usersService.getByDiscordId(discordId);
	if (!user) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	return ctx.json(user, 200);
};

export const handleCreateUser: RouteHandler<typeof createUserRoute> = async (
	ctx
) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create user for Discord ID [${body.discordId}]`
	);

	const newUser = await usersService.create({
		discordId: body.discordId,
		displayName: body.displayName,
		avatarUrl: body.avatarUrl
	});

	httpLogger.info(`API Success: Created user [ID: ${newUser.id}]`);
	return ctx.json(newUser, 201);
};

export const handleUpdateUser: RouteHandler<typeof updateUserRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update user [ID: ${id}]`);

	const updatedUser = await usersService.update(id, {
		displayName: body.displayName,
		avatarUrl: body.avatarUrl
	});

	if (!updatedUser) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	httpLogger.info(`API Success: Updated user [ID: ${id}]`);
	return ctx.json(updatedUser, 200);
};

export const handleDeleteUser: RouteHandler<typeof deleteUserRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete user [ID: ${id}]`);

	const deleted = await usersService.delete(id);
	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'User not found');
	}

	httpLogger.info(`API Success: Deleted user [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'User deleted successfully'
		},
		200
	);
};
