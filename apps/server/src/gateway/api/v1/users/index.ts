import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByDiscordIDRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByDiscordIDHandler,
	getByIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const usersRouter = new OpenAPIHono();

usersRouter.openapi(listRoute, listHandler);
usersRouter.openapi(getByDiscordIDRoute, getByDiscordIDHandler);
usersRouter.openapi(getByIDRoute, getByIDHandler);
usersRouter.openapi(createRoute, createHandler);
usersRouter.openapi(updateRoute, updateHandler);
usersRouter.openapi(deleteRoute, deleteHandler);
