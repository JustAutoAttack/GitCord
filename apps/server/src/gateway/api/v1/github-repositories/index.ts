import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByUrlRoute,
	getByIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByUrlHandler,
	getByIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const githubRepositoriesRouter = new OpenAPIHono();

githubRepositoriesRouter.openapi(listRoute, listHandler);
githubRepositoriesRouter.openapi(getByUrlRoute, getByUrlHandler);
githubRepositoriesRouter.openapi(getByIDRoute, getByIDHandler);
githubRepositoriesRouter.openapi(createRoute, createHandler);
githubRepositoriesRouter.openapi(updateRoute, updateHandler);
githubRepositoriesRouter.openapi(deleteRoute, deleteHandler);
