import { OpenAPIHono } from '@hono/zod-openapi';

import { discordAuthRoute, discordCallbackRoute, signOutRoute } from './routes';
import {
	discordAuthHandler,
	discordCallbackHandler,
	signOutHandler
} from './handlers';

export const authRouter = new OpenAPIHono();

authRouter.openapi(discordAuthRoute, discordAuthHandler);
authRouter.openapi(discordCallbackRoute, discordCallbackHandler);
authRouter.openapi(signOutRoute, signOutHandler);
