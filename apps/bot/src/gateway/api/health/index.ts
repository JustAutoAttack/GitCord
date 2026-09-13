import { OpenAPIHono } from '@hono/zod-openapi';

import {
	fullHealthHandler,
	livenessHandler,
	readinessHandler
} from './handlers';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const healthRouter = new OpenAPIHono();

healthRouter.openapi(liveRoute, livenessHandler);
healthRouter.openapi(readyRoute, readinessHandler);
healthRouter.openapi(fullHealthRoute, fullHealthHandler);
