import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByGuildAndUserRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByGuildAndUserHandler,
	getByIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const guildUserPermissionsRouter = new OpenAPIHono();

guildUserPermissionsRouter.openapi(listRoute, listHandler);
guildUserPermissionsRouter.openapi(
	getByGuildAndUserRoute,
	getByGuildAndUserHandler
);
guildUserPermissionsRouter.openapi(getByIDRoute, getByIDHandler);
guildUserPermissionsRouter.openapi(createRoute, createHandler);
guildUserPermissionsRouter.openapi(updateRoute, updateHandler);
guildUserPermissionsRouter.openapi(deleteRoute, deleteHandler);
