import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { githubRepositoriesService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByUrlRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	const { githubAppInstallationId } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: List GitHub repositories${githubAppInstallationId ? ` for installation [${githubAppInstallationId}]` : ''}`
	);

	const repos = await githubRepositoriesService.list(githubAppInstallationId);
	httpLogger.debug(
		`API Success: Returning ${repos.length} GitHub repositories`
	);
	return ctx.json(repos, 200);
};

export const getByUrlHandler: RouteHandler<typeof getByUrlRoute> = async (
	ctx
) => {
	const { repositoryUrl } = ctx.req.valid('query');
	httpLogger.debug(
		`API Request: Get GitHub repository by URL [${repositoryUrl}]`
	);

	const repo =
		await githubRepositoriesService.getByRepositoryUrl(repositoryUrl);

	if (!repo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'GitHub repository not found');
	}

	return ctx.json(repo, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get GitHub repository by ID [${id}]`);

	const repo = await githubRepositoriesService.getById(id);

	if (!repo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'GitHub repository not found');
	}

	return ctx.json(repo, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create GitHub repository [${body.repositoryFullName}]`
	);

	const newRepo = await githubRepositoriesService.create({
		githubAppInstallationId: body.githubAppInstallationId,
		repositoryUrl: body.repositoryUrl,
		repositoryFullName: body.repositoryFullName
	});

	httpLogger.info(
		`API Success: Created GitHub repository [ID: ${newRepo.id}]`
	);
	return ctx.json(newRepo, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update GitHub repository [ID: ${id}]`);

	const updatedRepo = await githubRepositoriesService.update(id, {
		githubAppInstallationId: body.githubAppInstallationId,
		repositoryUrl: body.repositoryUrl,
		repositoryFullName: body.repositoryFullName
	});

	if (!updatedRepo) {
		throw new AppError(ErrorCode.NOT_FOUND, 'GitHub repository not found');
	}

	httpLogger.info(`API Success: Updated GitHub repository [ID: ${id}]`);
	return ctx.json(updatedRepo, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete GitHub repository [ID: ${id}]`);

	const deleted = await githubRepositoriesService.delete(id);

	if (!deleted) {
		throw new AppError(ErrorCode.NOT_FOUND, 'GitHub repository not found');
	}

	httpLogger.info(`API Success: Deleted GitHub repository [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'GitHub repository deleted successfully'
		},
		200
	);
};
