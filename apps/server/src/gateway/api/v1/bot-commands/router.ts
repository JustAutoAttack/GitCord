import { OpenAPIHono } from '@hono/zod-openapi';
import * as controller from './controller';
import * as routes from './routes';

export const botCommandsRouter = new OpenAPIHono();

botCommandsRouter.openapi(
	routes.listBotCommandsRoute,
	controller.handleListBotCommands
);
botCommandsRouter.openapi(
	routes.getBotCommandByIdRoute,
	controller.handleGetBotCommandById
);
botCommandsRouter.openapi(
	routes.getBotCommandByNameRoute,
	controller.handleGetBotCommandByName
);
botCommandsRouter.openapi(
	routes.createBotCommandRoute,
	controller.handleCreateBotCommand
);
botCommandsRouter.openapi(
	routes.updateBotCommandRoute,
	controller.handleUpdateBotCommand
);
botCommandsRouter.openapi(
	routes.deleteBotCommandRoute,
	controller.handleDeleteBotCommand
);
