import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByCommandChannelRoute,
	getByGuildAndGithubRepositoryRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByCommandChannelHandler,
	getByGuildAndGithubRepositoryHandler,
	getByIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const guildRepositoriesRouter = new OpenAPIHono();

guildRepositoriesRouter.openapi(listRoute, listHandler);
guildRepositoriesRouter.openapi(
	getByGuildAndGithubRepositoryRoute,
	getByGuildAndGithubRepositoryHandler
);
guildRepositoriesRouter.openapi(getByIDRoute, getByIDHandler);
guildRepositoriesRouter.openapi(
	getByCommandChannelRoute,
	getByCommandChannelHandler
);
guildRepositoriesRouter.openapi(createRoute, createHandler);
guildRepositoriesRouter.openapi(updateRoute, updateHandler);
guildRepositoriesRouter.openapi(deleteRoute, deleteHandler);
