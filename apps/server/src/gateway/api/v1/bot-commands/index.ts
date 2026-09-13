import { OpenAPIHono } from '@hono/zod-openapi';

import {
	listRoute,
	getByIDRoute,
	getByNameRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByIDHandler,
	getByNameHandler,
	listHandler,
	updateHandler
} from './handlers';

export const botCommandsRouter = new OpenAPIHono();

botCommandsRouter.openapi(listRoute, listHandler);
botCommandsRouter.openapi(getByIDRoute, getByIDHandler);
botCommandsRouter.openapi(getByNameRoute, getByNameHandler);
botCommandsRouter.openapi(createRoute, createHandler);
botCommandsRouter.openapi(updateRoute, updateHandler);
botCommandsRouter.openapi(deleteRoute, deleteHandler);
