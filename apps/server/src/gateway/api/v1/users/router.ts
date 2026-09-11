import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const usersRouter = new OpenAPIHono();

usersRouter.openapi(routes.listUsersRoute, controller.handleListUsers);
usersRouter.openapi(
	routes.getUserByDiscordIdRoute,
	controller.handleGetUserByDiscordId
);
usersRouter.openapi(routes.getUserByIdRoute, controller.handleGetUserById);
usersRouter.openapi(routes.createUserRoute, controller.handleCreateUser);
usersRouter.openapi(routes.updateUserRoute, controller.handleUpdateUser);
usersRouter.openapi(routes.deleteUserRoute, controller.handleDeleteUser);
