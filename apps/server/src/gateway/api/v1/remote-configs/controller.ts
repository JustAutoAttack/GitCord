import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { remoteConfigsService } from '@services';
import {
	createRemoteConfigRoute,
	deleteRemoteConfigRoute,
	getRemoteConfigByCommandChannelRoute,
	getRemoteConfigByGuildAndRemoteRoute,
	getRemoteConfigByIdRoute,
	listRemoteConfigsRoute,
	updateRemoteConfigRoute
} from './routes';

export const handleListRemoteConfigs: RouteHandler<
	typeof listRemoteConfigsRoute
> = async (ctx) => {
	const { guildId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: List remote configurations${guildId ? ` for guild [${guildId}]` : ''}`
	);

	const configs = await remoteConfigsService.list(guildId);
	httpLogger.debug(
		`API Success: Returning ${configs.length} remote configurations`
	);
	return ctx.json(configs, 200);
};

export const handleGetRemoteConfigByGuildAndRemote: RouteHandler<
	typeof getRemoteConfigByGuildAndRemoteRoute
> = async (ctx) => {
	const { guildId, repositoryUrl } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: Get remote configuration for guild [${guildId}] and repo [${repositoryUrl}]`
	);

	const config = await remoteConfigsService.getByGuildAndRepo(
		guildId,
		repositoryUrl
	);

	if (!config) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Remote configuration not found'
		);
	}

	return ctx.json(config, 200);
};

export const handleGetRemoteConfigById: RouteHandler<
	typeof getRemoteConfigByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get remote configuration by ID [${id}]`);

	const config = await remoteConfigsService.getById(id);

	if (!config) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Remote configuration not found'
		);
	}

	return ctx.json(config, 200);
};

export const handleGetRemoteConfigByCommandChannel: RouteHandler<
	typeof getRemoteConfigByCommandChannelRoute
> = async (ctx) => {
	const { commandChannelId } = ctx.req.valid('param');
	httpLogger.debug(
		`API Request: Get remote configuration by command channel [${commandChannelId}]`
	);

	const config =
		await remoteConfigsService.getByCommandChannelId(commandChannelId);

	if (!config) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Remote configuration not found for channel'
		);
	}

	return ctx.json(config, 200);
};

export const handleCreateRemoteConfig: RouteHandler<
	typeof createRemoteConfigRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create remote configuration for guild [${body.guildId}] (${body.repositoryUrl})`
	);

	const newConfig = await remoteConfigsService.create({
		guildId: body.guildId,
		repositoryUrl: body.repositoryUrl,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	httpLogger.info(
		`API Success: Created remote configuration [ID: ${newConfig.id}]`
	);
	return ctx.json(newConfig, 201);
};

export const handleUpdateRemoteConfig: RouteHandler<
	typeof updateRemoteConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update remote configuration [ID: ${id}]`);

	const updatedConfig = await remoteConfigsService.update(id, {
		guildId: body.guildId,
		repositoryUrl: body.repositoryUrl,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	if (!updatedConfig) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Remote configuration not found'
		);
	}

	httpLogger.info(
		`API Success: Updated remote configuration [ID: ${id}]`
	);
	return ctx.json(updatedConfig, 200);
};

export const handleDeleteRemoteConfig: RouteHandler<
	typeof deleteRemoteConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete remote configuration [ID: ${id}]`);

	const deleted = await remoteConfigsService.delete(id);

	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Remote configuration not found'
		);
	}

	httpLogger.info(
		`API Success: Deleted remote configuration [ID: ${id}]`
	);
	return ctx.json(
		{
			success: true,
			message: 'Remote configuration deleted successfully'
		},
		200
	);
};
