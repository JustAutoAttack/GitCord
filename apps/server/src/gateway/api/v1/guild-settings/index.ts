import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByGuildRoute,
	getByIDRoute,
	getBySystemChannelRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByGuildHandler,
	getByIDHandler,
	getBySystemChannelHandler,
	listHandler,
	updateHandler
} from './handlers';

export const guildSettingsRouter = new OpenAPIHono();

guildSettingsRouter.openapi(listRoute, listHandler);
guildSettingsRouter.openapi(getByIDRoute, getByIDHandler);
guildSettingsRouter.openapi(getByGuildRoute, getByGuildHandler);
guildSettingsRouter.openapi(getBySystemChannelRoute, getBySystemChannelHandler);
guildSettingsRouter.openapi(createRoute, createHandler);
guildSettingsRouter.openapi(updateRoute, updateHandler);
guildSettingsRouter.openapi(deleteRoute, deleteHandler);
