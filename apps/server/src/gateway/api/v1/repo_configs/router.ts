import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const repoConfigsRouter = new OpenAPIHono();

repoConfigsRouter.openapi(
	routes.listRepoConfigsRoute,
	controller.handleListRepoConfigs
);

repoConfigsRouter.openapi(
	routes.getRepoConfigByIdRoute,
	controller.handleGetRepoConfigById
);

repoConfigsRouter.openapi(
	routes.getRepoConfigByCommandChannelRoute,
	controller.handleGetRepoConfigByCommandChannel
);

repoConfigsRouter.openapi(
	routes.createRepoConfigRoute,
	controller.handleCreateRepoConfig
);

repoConfigsRouter.openapi(
	routes.updateRepoConfigRoute,
	controller.handleUpdateRepoConfig
);

repoConfigsRouter.openapi(
	routes.deleteRepoConfigRoute,
	controller.handleDeleteRepoConfig
);
