import { OpenAPIHono } from '@hono/zod-openapi';

import {
	discordBotInstallRoute,
	discordBotInstallCallbackRoute
} from './routes';
import {
	discordBotInstallHandler,
	discordBotInstallCallbackHandler
} from './handlers';

export const integrationsRouter = new OpenAPIHono();

integrationsRouter.openapi(discordBotInstallRoute, discordBotInstallHandler);
integrationsRouter.openapi(
	discordBotInstallCallbackRoute,
	discordBotInstallCallbackHandler
);
