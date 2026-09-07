import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode } from '@core';
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
	const configs = await repoConfigsService.list();

	return ctx.json(configs, 200);
};

export const handleGetRepoConfigById: RouteHandler<
	typeof getRepoConfigByIdRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');

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

	const newConfig = await repoConfigsService.create({
		guildId: body.guildId,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	return ctx.json(newConfig, 201);
};

export const handleUpdateRepoConfig: RouteHandler<
	typeof updateRepoConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');

	const updatedConfig = await repoConfigsService.update(id, {
		guildId: body.guildId,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	if (!updatedConfig) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found'
		);
	}

	return ctx.json(updatedConfig, 200);
};

export const handleDeleteRepoConfig: RouteHandler<
	typeof deleteRepoConfigRoute
> = async (ctx) => {
	const { id } = ctx.req.valid('param');

	const deleted = await repoConfigsService.delete(id);

	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Repository configuration not found'
		);
	}

	return ctx.json(
		{
			success: true,
			message: 'Repository configuration deleted successfully'
		},
		200
	);
};
