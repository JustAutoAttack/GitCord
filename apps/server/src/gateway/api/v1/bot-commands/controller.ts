import type { RouteHandler } from '@hono/zod-openapi';
import { AppError, ErrorCode, httpLogger } from '@core';
import { botCommandsService } from '@services';
import {
	createBotCommandRoute,
	deleteBotCommandRoute,
	getBotCommandByIdRoute,
	getBotCommandByNameRoute,
	listBotCommandsRoute,
	updateBotCommandRoute
} from './routes';

export const handleListBotCommands: RouteHandler<
	typeof listBotCommandsRoute
> = async (ctx) => {
	httpLogger.debug('API Request: List all bot commands');
	const commands = await botCommandsService.list();
	return ctx.json(commands, 200);
};

export const handleGetBotCommandById: RouteHandler<
	typeof getBotCommandByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const command = await botCommandsService.getById(id);
	if (!command)
		throw new AppError(ErrorCode.NOT_FOUND, 'Bot command not found');
	return ctx.json(command, 200);
};

export const handleGetBotCommandByName: RouteHandler<
	typeof getBotCommandByNameRoute
> = async (ctx) => {
	const { commandName } = ctx.req.valid('param');
	const command = await botCommandsService.getByCommandName(commandName);
	if (!command)
		throw new AppError(ErrorCode.NOT_FOUND, 'Bot command not found');
	return ctx.json(command, 200);
};

export const handleCreateBotCommand: RouteHandler<
	typeof createBotCommandRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	const command = await botCommandsService.create(body);
	return ctx.json(command, 201);
};

export const handleUpdateBotCommand: RouteHandler<
	typeof updateBotCommandRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	const command = await botCommandsService.update(id, body);
	return ctx.json(command, 200);
};

export const handleDeleteBotCommand: RouteHandler<
	typeof deleteBotCommandRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	await botCommandsService.delete(id);
	return ctx.json(
		{ success: true, message: 'Bot command deleted successfully' },
		200
	);
};
