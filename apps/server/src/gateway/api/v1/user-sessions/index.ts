import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByIDRoute,
	getByUserIdRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByIDHandler,
	getByUserIdHandler,
	listHandler,
	updateHandler
} from './handlers';

export const userSessionsRouter = new OpenAPIHono();

userSessionsRouter.openapi(listRoute, listHandler);
userSessionsRouter.openapi(getByUserIdRoute, getByUserIdHandler);
userSessionsRouter.openapi(getByIDRoute, getByIDHandler);
userSessionsRouter.openapi(createRoute, createHandler);
userSessionsRouter.openapi(updateRoute, updateHandler);
userSessionsRouter.openapi(deleteRoute, deleteHandler);
