import { OpenAPIHono } from '@hono/zod-openapi';

import {
	createRoute,
	deleteRoute,
	getByIDRoute,
	getByInstallationIDRoute,
	listRoute,
	updateRoute
} from './routes';
import {
	createHandler,
	deleteHandler,
	getByIDHandler,
	getByInstallationIDHandler,
	listHandler,
	updateHandler
} from './handlers';

export const githubAppInstallationsRouter = new OpenAPIHono();

githubAppInstallationsRouter.openapi(listRoute, listHandler);
githubAppInstallationsRouter.openapi(getByIDRoute, getByIDHandler);
githubAppInstallationsRouter.openapi(
	getByInstallationIDRoute,
	getByInstallationIDHandler
);
githubAppInstallationsRouter.openapi(createRoute, createHandler);
githubAppInstallationsRouter.openapi(updateRoute, updateHandler);
githubAppInstallationsRouter.openapi(deleteRoute, deleteHandler);
