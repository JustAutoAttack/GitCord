import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const healthRouter = new OpenAPIHono();

healthRouter.openapi(routes.liveRoute, controller.getLiveness);
healthRouter.openapi(routes.readyRoute, controller.getReadiness);
healthRouter.openapi(routes.fullHealthRoute, controller.getHealthOverview);
