import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ErrorCode, httpLogger } from '@core';
import { githubAppInstallationsService } from '@services';
import {
	createRoute,
	deleteRoute,
	getByIDRoute,
	getByInstallationIDRoute,
	listRoute,
	updateRoute
} from './routes';

export const listHandler: RouteHandler<typeof listRoute> = async (ctx) => {
	httpLogger.debug('API Request: List GitHub app installations');

	const installations = await githubAppInstallationsService.list();
	httpLogger.debug(
		`API Success: Returning ${installations.length} GitHub app installations`
	);
	return ctx.json(installations, 200);
};

export const getByIDHandler: RouteHandler<typeof getByIDRoute> = async (
	ctx
) => {
	const { id } = ctx.req.valid('param');
	httpLogger.debug(`API Request: Get GitHub app installation by ID [${id}]`);

	const installation = await githubAppInstallationsService.getById(id);

	if (!installation) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'GitHub app installation not found'
		);
	}

	return ctx.json(installation, 200);
};

export const getByInstallationIDHandler: RouteHandler<
	typeof getByInstallationIDRoute
> = async (ctx) => {
	const { installationId } = ctx.req.valid('param');
	httpLogger.debug(
		`API Request: Get GitHub app installation by installation ID [${installationId}]`
	);

	const installation =
		await githubAppInstallationsService.getByInstallationId(
			Number(installationId)
		);

	if (!installation) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'GitHub app installation not found'
		);
	}

	return ctx.json(installation, 200);
};

export const createHandler: RouteHandler<typeof createRoute> = async (ctx) => {
	const body = ctx.req.valid('json');
	httpLogger.info(
		`API Request: Create GitHub app installation for account [${body.accountLogin}] (${body.installationId})`
	);

	const newInstallation = await githubAppInstallationsService.create({
		installationId: body.installationId,
		accountLogin: body.accountLogin,
		accountType: body.accountType
	});

	httpLogger.info(
		`API Success: Created GitHub app installation [ID: ${newInstallation.id}]`
	);
	return ctx.json(newInstallation, 201);
};

export const updateHandler: RouteHandler<typeof updateRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	const body = ctx.req.valid('json');
	httpLogger.info(`API Request: Update GitHub app installation [ID: ${id}]`);

	const updatedInstallation = await githubAppInstallationsService.update(id, {
		installationId: body.installationId,
		accountLogin: body.accountLogin,
		accountType: body.accountType
	});

	if (!updatedInstallation) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'GitHub app installation not found'
		);
	}

	httpLogger.info(`API Success: Updated GitHub app installation [ID: ${id}]`);
	return ctx.json(updatedInstallation, 200);
};

export const deleteHandler: RouteHandler<typeof deleteRoute> = async (ctx) => {
	const { id } = ctx.req.valid('param');
	httpLogger.info(`API Request: Delete GitHub app installation [ID: ${id}]`);

	const deleted = await githubAppInstallationsService.delete(id);

	if (!deleted) {
		throw new AppError(
			ErrorCode.NOT_FOUND,
			'GitHub app installation not found'
		);
	}

	httpLogger.info(`API Success: Deleted GitHub app installation [ID: ${id}]`);
	return ctx.json(
		{
			success: true,
			message: 'GitHub app installation deleted successfully'
		},
		200
	);
};
