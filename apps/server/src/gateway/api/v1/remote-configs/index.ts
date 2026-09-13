import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByCommandChannelRoute,
	getByGuildAndRemoteRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByCommandChannelHandler,
	getByGuildAndRemoteHandler,
	getByIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const remoteConfigsRouter = new OpenAPIHono();

remoteConfigsRouter.openapi(listRoute, listHandler);
remoteConfigsRouter.openapi(
	getByGuildAndRemoteRoute,
	getByGuildAndRemoteHandler
);
remoteConfigsRouter.openapi(getByIDRoute, getByIDHandler);
remoteConfigsRouter.openapi(
	getByCommandChannelRoute,
	getByCommandChannelHandler
);
remoteConfigsRouter.openapi(createRoute, createHandler);
remoteConfigsRouter.openapi(updateRoute, updateHandler);
remoteConfigsRouter.openapi(deleteRoute, deleteHandler);
