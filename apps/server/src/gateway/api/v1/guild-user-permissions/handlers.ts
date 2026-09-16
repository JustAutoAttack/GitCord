import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { guildUserPermissionsService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByGuildAndUserRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import { logger } from '../../logger';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	const { guildId } = ctx.req.valid('query');
	logger.debug(
		`API Request: List guild user permissions${guildId ? ` for guild [${guildId}]` : ''}`
	);

	const permissions = await guildUserPermissionsService.list(guildId);
	logger.debug(
		`API Success: Returning ${permissions.length} permission record(s)`
	);
	return ctx.json(permissions, 200);
};

export const getByGuildAndUserHandler: RouteHandler<
	typeof getByGuildAndUserRoute
> = async (ctx) => {
	const { guildId, discordUserId } = ctx.req.valid('query');
	logger.debug(
		`API Request: Get permissions for user [${discordUserId}] in guild [${guildId}]`
	);

	const permissions = await guildUserPermissionsService.getByGuildAndUser(
		guildId,
		discordUserId
	);
	return ctx.json(permissions, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	logger.debug(`API Request: Get guild user permission by ID [${id}]`);

	const permission = await guildUserPermissionsService.getById(id);
	if (!permission) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild user permission not found'
		);
	}

	return ctx.json(permission, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	logger.info(
		`API Request: Grant command [${body.commandId}] to user [${body.discordUserId}] in guild [${body.guildId}]`
	);

	const newPermission = await guildUserPermissionsService.create({
		guildId: body.guildId,
		discordUserId: body.discordUserId,
		commandId: body.commandId
	});

	logger.info(
		`API Success: Created guild user permission [ID: ${newPermission.id}]`
	);
	return ctx.json(newPermission, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	logger.info(`API Request: Update guild user permission [ID: ${id}]`);

	const updatedPermission = await guildUserPermissionsService.update(id, {
		guildId: body.guildId,
		discordUserId: body.discordUserId,
		commandId: body.commandId
	});

	if (!updatedPermission) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild user permission not found'
		);
	}

	logger.info(`API Success: Updated guild user permission [ID: ${id}]`);
	return ctx.json(updatedPermission, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.info(`API Request: Delete guild user permission [ID: ${id}]`);

	const deleted = await guildUserPermissionsService.delete(id);
	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild user permission not found'
		);
	}

	logger.info(`API Success: Deleted guild user permission [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Guild user permission deleted successfully'
		},
		200
	);
};
