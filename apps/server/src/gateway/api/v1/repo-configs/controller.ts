import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { repoConfigsService } from '@services';
import {
	createRepoConfigRoute,
	deleteRepoConfigRoute,
	getRepoConfigByCommandChannelRoute,
	getRepoConfigByIdRoute,
	listRepoConfigsRoute,
	updateRepoConfigRoute
} from './routes';

export const handleListRepoConfigs: RouteHandler<
	typeof listRepoConfigsRoute
> = async (ctx) => {
	httpLogger.debug('API Request: List repository configurations');
	const configs = await repoConfigsService.list();
	httpLogger.debug(
		`API Success: Returning ${configs.length} repository configurations`
	);
	return ctx.json(configs, 200);
};

export const handleGetRepoConfigById: RouteHandler<
	typeof getRepoConfigByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get repository configuration by ID [${id}]`);

	const config = await repoConfigsService.getById(id);

	if (!config) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found'
		);
	}

	return ctx.json(config, 200);
};

export const handleGetRepoConfigByCommandChannel: RouteHandler<
	typeof getRepoConfigByCommandChannelRoute
> = async (ctx) => {
	const { commandChannelId } = ctx.req.valid('param');
	httpLogger.debug(
		`API Request: Get repository configuration by command channel [${commandChannelId}]`
	);

	const config =
		await repoConfigsService.getByCommandChannelId(commandChannelId);

	if (!config) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found for channel'
		);
	}

	return ctx.json(config, 200);
};

export const handleCreateRepoConfig: RouteHandler<
	typeof createRepoConfigRoute
> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create repository configuration for guild [${body.guildId}] (${body.repositoryUrl})`
	);

	const newConfig = await repoConfigsService.create({
		guildId: body.guildId,
		repositoryUrl: body.repositoryUrl,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	httpLogger.info(
		`API Success: Created repository configuration [ID: ${newConfig.id}]`
	);
	return ctx.json(newConfig, 201);
};

export const handleUpdateRepoConfig: RouteHandler<
	typeof updateRepoConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update repository configuration [ID: ${id}]`);

	const updatedConfig = await repoConfigsService.update(id, {
		guildId: body.guildId,
		repositoryUrl: body.repositoryUrl,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	if (!updatedConfig) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found'
		);
	}

	httpLogger.info(
		`API Success: Updated repository configuration [ID: ${id}]`
	);
	return ctx.json(updatedConfig, 200);
};

export const handleDeleteRepoConfig: RouteHandler<
	typeof deleteRepoConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete repository configuration [ID: ${id}]`);

	const deleted = await repoConfigsService.delete(id);

	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found'
		);
	}

	httpLogger.info(
		`API Success: Deleted repository configuration [ID: ${id}]`
	);
	return ctx.json(
		{
			success: true,
			message: 'Repository configuration deleted successfully'
		},
		200
	);
};
