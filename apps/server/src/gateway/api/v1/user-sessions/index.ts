import { OpenAPIHono } from '@hono/zod-openapi';

import {
	deleteRoute,
	getByIDRoute,
	getByUserIdRoute,
	listRoute,
} from './routes';
import {
	deleteHandler,
	getByIDHandler,
	getByUserIdHandler,
	listHandler,
} from './handlers';

export const userSessionsRouter = new OpenAPIHono();

userSessionsRouter.openapi(listRoute, listHandler);
userSessionsRouter.openapi(getByUserIdRoute, getByUserIdHandler);
userSessionsRouter.openapi(getByIDRoute, getByIDHandler);
userSessionsRouter.openapi(deleteRoute, deleteHandler);
