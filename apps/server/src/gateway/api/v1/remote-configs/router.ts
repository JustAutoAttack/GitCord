import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const remoteConfigsRouter = new OpenAPIHono();

remoteConfigsRouter.openapi(
	routes.listRemoteConfigsRoute,
	controller.handleListRemoteConfigs
);

remoteConfigsRouter.openapi(
	routes.getRemoteConfigByGuildAndRemoteRoute,
	controller.handleGetRemoteConfigByGuildAndRemote
);

remoteConfigsRouter.openapi(
	routes.getRemoteConfigByIdRoute,
	controller.handleGetRemoteConfigById
);

remoteConfigsRouter.openapi(
	routes.getRemoteConfigByCommandChannelRoute,
	controller.handleGetRemoteConfigByCommandChannel
);

remoteConfigsRouter.openapi(
	routes.createRemoteConfigRoute,
	controller.handleCreateRemoteConfig
);

remoteConfigsRouter.openapi(
	routes.updateRemoteConfigRoute,
	controller.handleUpdateRemoteConfig
);

remoteConfigsRouter.openapi(
	routes.deleteRemoteConfigRoute,
	controller.handleDeleteRemoteConfig
);
