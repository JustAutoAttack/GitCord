import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { guildUserPermissionsService } from '@services';
import {
	createGuildUserPermissionRoute,
	deleteGuildUserPermissionRoute,
	getGuildUserPermissionByGuildAndUserRoute,
	getGuildUserPermissionByIdRoute,
	listGuildUserPermissionsRoute,
	updateGuildUserPermissionRoute
} from './routes';

export const handleListGuildUserPermissions: RouteHandler<
	typeof listGuildUserPermissionsRoute
> = async (ctx) => {
	const { guildId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: List guild user permissions${guildId ? ` for guild [${guildId}]` : ''}`
	);

	const permissions = await guildUserPermissionsService.list(guildId);
	httpLogger.debug(
		`API Success: Returning ${permissions.length} permission record(s)`
	);
	return ctx.json(permissions, 200);
};

export const handleGetGuildUserPermissionByGuildAndUser: RouteHandler<
	typeof getGuildUserPermissionByGuildAndUserRoute
> = async (ctx) => {
	const { guildId, discordUserId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: Get permissions for user [${discordUserId}] in guild [${guildId}]`
	);

	const permissions = await guildUserPermissionsService.getByGuildAndUser(
		guildId,
		discordUserId
	);
	return ctx.json(permissions, 200);
};

export const handleGetGuildUserPermissionById: RouteHandler<
	typeof getGuildUserPermissionByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get guild user permission by ID [${id}]`);

	const permission = await guildUserPermissionsService.getById(id);
	if (!permission) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild user permission not found'
		);
	}

	return ctx.json(permission, 200);
};

export const handleCreateGuildUserPermission: RouteHandler<
	typeof createGuildUserPermissionRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Grant command [${body.commandId}] to user [${body.discordUserId}] in guild [${body.guildId}]`
	);

	const newPermission = await guildUserPermissionsService.create({
		guildId: body.guildId,
		discordUserId: body.discordUserId,
		commandId: body.commandId
	});

	httpLogger.info(
		`API Success: Created guild user permission [ID: ${newPermission.id}]`
	);
	return ctx.json(newPermission, 201);
};

export const handleUpdateGuildUserPermission: RouteHandler<
	typeof updateGuildUserPermissionRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update guild user permission [ID: ${id}]`);

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

	httpLogger.info(`API Success: Updated guild user permission [ID: ${id}]`);
	return ctx.json(updatedPermission, 200);
};

export const handleDeleteGuildUserPermission: RouteHandler<
	typeof deleteGuildUserPermissionRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete guild user permission [ID: ${id}]`);

	const deleted = await guildUserPermissionsService.delete(id);
	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild user permission not found'
		);
	}

	httpLogger.info(`API Success: Deleted guild user permission [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Guild user permission deleted successfully'
		},
		200
	);
};
