import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const guildUserPermissionsRouter = new OpenAPIHono();

guildUserPermissionsRouter.openapi(
	routes.listGuildUserPermissionsRoute,
	controller.handleListGuildUserPermissions
);
guildUserPermissionsRouter.openapi(
	routes.getGuildUserPermissionByGuildAndUserRoute,
	controller.handleGetGuildUserPermissionByGuildAndUser
);
guildUserPermissionsRouter.openapi(
	routes.getGuildUserPermissionByIdRoute,
	controller.handleGetGuildUserPermissionById
);
guildUserPermissionsRouter.openapi(
	routes.createGuildUserPermissionRoute,
	controller.handleCreateGuildUserPermission
);
guildUserPermissionsRouter.openapi(
	routes.updateGuildUserPermissionRoute,
	controller.handleUpdateGuildUserPermission
);
guildUserPermissionsRouter.openapi(
	routes.deleteGuildUserPermissionRoute,
	controller.handleDeleteGuildUserPermission
);
