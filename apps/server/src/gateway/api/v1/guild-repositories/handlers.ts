import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { guildRepositoriesService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByCommandChannelRoute,
	getByGuildAndGithubRepositoryRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	const { guildId, githubRepositoryId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: List guild repositories${guildId ? ` for guild [${guildId}]` : ''}${githubRepositoryId ? ` for GitHub repository [${githubRepositoryId}]` : ''}`
	);

	const guildRepos = await guildRepositoriesService.list(
		guildId,
		githubRepositoryId
	);
	httpLogger.debug(
		`API Success: Returning ${guildRepos.length} guild repositories`
	);
	return ctx.json(guildRepos, 200);
};

export const getByGuildAndGithubRepositoryHandler: RouteHandler<
	typeof getByGuildAndGithubRepositoryRoute
> = async (ctx) => {
	const { guildId, githubRepositoryId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: Get guild repository for guild [${guildId}] and GitHub repository [${githubRepositoryId}]`
	);

	const guildRepo =
		await guildRepositoriesService.getByGuildAndGithubRepositoryId(
			guildId,
			githubRepositoryId
		);

	if (!guildRepo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild repository not found');
	}

	return ctx.json(guildRepo, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get guild repository by ID [${id}]`);

	const guildRepo = await guildRepositoriesService.getById(id);

	if (!guildRepo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild repository not found');
	}

	return ctx.json(guildRepo, 200);
};

export const getByCommandChannelHandler: RouteHandler<
	typeof getByCommandChannelRoute
> = async (ctx) => {
	const { commandChannelId } = ctx.req.valid('param');
	httpLogger.debug(
		`API Request: Get guild repository by command channel [${commandChannelId}]`
	);

	const guildRepo =
		await guildRepositoriesService.getByCommandChannelId(commandChannelId);

	if (!guildRepo) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'Guild repository not found for channel'
		);
	}

	return ctx.json(guildRepo, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create guild repository for guild [${body.guildId}] (GitHub repository ID: ${body.githubRepositoryId})`
	);

	const newGuildRepo = await guildRepositoriesService.create({
		guildId: body.guildId,
		githubRepositoryId: body.githubRepositoryId,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	httpLogger.info(
		`API Success: Created guild repository [ID: ${newGuildRepo.id}]`
	);
	return ctx.json(newGuildRepo, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update guild repository [ID: ${id}]`);

	const updatedGuildRepo = await guildRepositoriesService.update(id, {
		guildId: body.guildId,
		githubRepositoryId: body.githubRepositoryId,
		commandChannelId: body.commandChannelId,
		notificationChannelId: body.notificationChannelId
	});

	if (!updatedGuildRepo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild repository not found');
	}

	httpLogger.info(`API Success: Updated guild repository [ID: ${id}]`);
	return ctx.json(updatedGuildRepo, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete guild repository [ID: ${id}]`);

	const deleted = await guildRepositoriesService.delete(id);

	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'Guild repository not found');
	}

	httpLogger.info(`API Success: Deleted guild repository [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'Guild repository deleted successfully'
		},
		200
	);
};
