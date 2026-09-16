import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
import { guildSettingsService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByGuildRoute,
	getByIDRoute,
	getBySystemChannelRoute,
	listRoute,
	updateRoute
} from './routes';
import { logger } from '../../logger';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	logger.debug('API Request: List guild settings');
	const { notifyOnConnection } = ctx.req.valid('query');

	const settings = await guildSettingsService.list(notifyOnConnection);
	logger.debug(
		`API Success: Returning ${settings.length} guild setting(s)`
	);
	return ctx.json(settings, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	logger.debug(`API Request: Get guild setting by ID [${id}]`);

	const setting = await guildSettingsService.getById(id);

	if (!setting) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild setting not found');
	}

	return ctx.json(setting, 200);
};

export const getByGuildHandler: RouteHandler<typeof getByGuildRoute> = async (
	ctx
) => {
	const { guildId } = ctx.req.valid('param');
	logger.debug(`API Request: Get guild setting for guild [${guildId}]`);

	const setting = await guildSettingsService.getByGuildId(guildId);

	if (!setting) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild setting not found for guild'
		);
	}

	return ctx.json(setting, 200);
};

export const getBySystemChannelHandler: RouteHandler<
	typeof getBySystemChannelRoute
> = async (ctx) => {
	const { systemChannelId } = ctx.req.valid('param');
	logger.debug(
		`API Request: Get guild setting by system channel [${systemChannelId}]`
	);

	const setting =
		await guildSettingsService.getBySystemChannelId(systemChannelId);

	if (!setting) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild setting not found for system channel'
		);
	}

	return ctx.json(setting, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	logger.info(
		`API Request: Create guild setting for guild [${body.guildId}]`
	);

	const newSetting = await guildSettingsService.create({
		guildId: body.guildId,
		systemChannelId: body.systemChannelId,
		notifyOnConnection: body.notifyOnConnection
	});

	logger.info(
		`API Success: Created guild setting [ID: ${newSetting.id}]`
	);
	return ctx.json(newSetting, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	logger.info(`API Request: Update guild setting [ID: ${id}]`);

	const updatedSetting = await guildSettingsService.update(id, {
		guildId: body.guildId,
		systemChannelId: body.systemChannelId,
		notifyOnConnection: body.notifyOnConnection
	});

	logger.info(`API Success: Updated guild setting [ID: ${id}]`);
	return ctx.json(updatedSetting, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	logger.info(`API Request: Delete guild setting [ID: ${id}]`);

	await guildSettingsService.delete(id);

	logger.info(`API Success: Deleted guild setting [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Guild setting deleted successfully'
		},
		200
	);
};
