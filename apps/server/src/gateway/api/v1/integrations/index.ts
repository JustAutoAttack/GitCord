import { OpenAPIHono } from '@hono/zod-openapi';

import {
	githubAppInstallRoute,
	discordBotInstallRoute,
	discordBotInstallCallbackRoute
} from './routes';
import {
	githubAppInstallHandler,
	discordBotInstallHandler,
	discordBotInstallCallbackHandler
} from './handlers';

export const integrationsRouter = new OpenAPIHono();

integrationsRouter.openapi(githubAppInstallRoute, githubAppInstallHandler);

integrationsRouter.openapi(discordBotInstallRoute, discordBotInstallHandler);

integrationsRouter.openapi(
	discordBotInstallCallbackRoute,
	discordBotInstallCallbackHandler
);
