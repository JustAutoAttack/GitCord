import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { botCommandsService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByIDRoute,
	getByNameRoute,
	listRoute,
	updateRoute
} from './routes';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	httpLogger.debug('API Request: List all bot commands');
	const commands = await botCommandsService.list();
	return ctx.json(commands, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	const command = await botCommandsService.getById(id);
	if (!command)
		throw new AppError(ErrorCode.NOT_FOUND, 'Bot command not found');
	return ctx.json(command, 200);
};

export const getByNameHandler: RouteHandler<typeof getByNameRoute> = async (
	ctx
) => {
	const { commandName } = ctx.req.valid('param');
	const command = await botCommandsService.getByCommandName(commandName);
	if (!command)
		throw new AppError(ErrorCode.NOT_FOUND, 'Bot command not found');
	return ctx.json(command, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	const command = await botCommandsService.create(body);
	return ctx.json(command, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	const command = await botCommandsService.update(id, body);
	return ctx.json(command, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	await botCommandsService.delete(id);
	return ctx.json(
		{ success: true, message: 'Bot command deleted successfully' },
		200
	);
};
