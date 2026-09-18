import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByDiscordIDRoute,
	getByIDRoute,
	getMeRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByDiscordIDHandler,
	getByIDHandler,
	getMeHandler,
	listHandler,
	updateHandler
} from './handlers';

export const usersRouter = new OpenAPIHono();

usersRouter.openapi(listRoute, listHandler);
usersRouter.openapi(getMeRoute, getMeHandler);
usersRouter.openapi(getByDiscordIDRoute, getByDiscordIDHandler);
usersRouter.openapi(getByIDRoute, getByIDHandler);
usersRouter.openapi(createRoute, createHandler);
usersRouter.openapi(updateRoute, updateHandler);
usersRouter.openapi(deleteRoute, deleteHandler);
