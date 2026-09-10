import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { guildSettingsService } from '@services';
import {
	createGuildSettingRoute,
	deleteGuildSettingRoute,
	getGuildSettingByGuildRoute,
	getGuildSettingByIdRoute,
	getGuildSettingBySystemChannelRoute,
	listGuildSettingsRoute,
	updateGuildSettingRoute
} from './routes';

export const handleListGuildSettings: RouteHandler<
	typeof listGuildSettingsRoute
> = async (ctx) => {
	httpLogger.debug('API Request: List guild settings');

	const settings = await guildSettingsService.list();
	httpLogger.debug(
		`API Success: Returning ${settings.length} guild setting(s)`
	);
	return ctx.json(settings, 200);
};

export const handleGetGuildSettingById: RouteHandler<
	typeof getGuildSettingByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get guild setting by ID [${id}]`);

	const setting = await guildSettingsService.getById(id);

	if (!setting) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild setting not found');
	}

	return ctx.json(setting, 200);
};

export const handleGetGuildSettingByGuild: RouteHandler<
	typeof getGuildSettingByGuildRoute
> = async (ctx) => {
	const { guildId } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get guild setting for guild [${guildId}]`);

	const setting = await guildSettingsService.getByGuildId(guildId);

	if (!setting) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild setting not found for guild'
		);
	}

	return ctx.json(setting, 200);
};

export const handleGetGuildSettingBySystemChannel: RouteHandler<
	typeof getGuildSettingBySystemChannelRoute
> = async (ctx) => {
	const { systemChannelId } = ctx.req.valid('param');
	httpLogger.debug(
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

export const handleCreateGuildSetting: RouteHandler<
	typeof createGuildSettingRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create guild setting for guild [${body.guildId}]`
	);

	const newSetting = await guildSettingsService.create({
		guildId: body.guildId,
		systemChannelId: body.systemChannelId
	});

	httpLogger.info(
		`API Success: Created guild setting [ID: ${newSetting.id}]`
	);
	return ctx.json(newSetting, 201);
};

export const handleUpdateGuildSetting: RouteHandler<
	typeof updateGuildSettingRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update guild setting [ID: ${id}]`);

	const updatedSetting = await guildSettingsService.update(id, {
		guildId: body.guildId,
		systemChannelId: body.systemChannelId
	});

	httpLogger.info(`API Success: Updated guild setting [ID: ${id}]`);
	return ctx.json(updatedSetting, 200);
};

export const handleDeleteGuildSetting: RouteHandler<
	typeof deleteGuildSettingRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete guild setting [ID: ${id}]`);

	await guildSettingsService.delete(id);

	httpLogger.info(`API Success: Deleted guild setting [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Guild setting deleted successfully'
		},
		200
	);
};
