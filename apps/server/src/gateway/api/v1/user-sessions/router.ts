import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const userSessionsRouter = new OpenAPIHono();

userSessionsRouter.openapi(
	routes.listUserSessionsRoute,
	controller.handleListUserSessions
);
userSessionsRouter.openapi(
	routes.getUserSessionByUserIdRoute,
	controller.handleGetUserSessionByUserId
);
userSessionsRouter.openapi(
	routes.getUserSessionByIdRoute,
	controller.handleGetUserSessionById
);
userSessionsRouter.openapi(
	routes.createUserSessionRoute,
	controller.handleCreateUserSession
);
userSessionsRouter.openapi(
	routes.updateUserSessionRoute,
	controller.handleUpdateUserSession
);
userSessionsRouter.openapi(
	routes.deleteUserSessionRoute,
	controller.handleDeleteUserSession
);
