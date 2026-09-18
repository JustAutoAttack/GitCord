import { OpenAPIHono } from '@hono/zod-openapi';

import { signUpRoute, signOutRoute, discordCallbackRoute } from './routes';
import {
	signUpHandler,
	signOutHandler,
	discordCallbackHandler
} from './handlers';

export const authRouter = new OpenAPIHono();

authRouter.openapi(signUpRoute, signUpHandler);
authRouter.openapi(signOutRoute, signOutHandler);
authRouter.openapi(discordCallbackRoute, discordCallbackHandler);
