import { OpenAPIHono } from '@hono/zod-openapi';

import {
	deleteRoute,
	getByIDRoute,
	getByUserIdRoute,
	listRoute
} from './routes';
import {
	deleteHandler,
	getByIDHandler,
	getByUserIdHandler,
	listHandler
} from './handlers';

export const discordSessionsRouter = new OpenAPIHono();

discordSessionsRouter.openapi(listRoute, listHandler);
discordSessionsRouter.openapi(getByUserIdRoute, getByUserIdHandler);
discordSessionsRouter.openapi(getByIDRoute, getByIDHandler);
discordSessionsRouter.openapi(deleteRoute, deleteHandler);
