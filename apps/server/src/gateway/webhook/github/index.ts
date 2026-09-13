import { OpenAPIHono } from '@hono/zod-openapi';

import { eventRoute } from './routes';
import { eventHandler } from './handlers';

export const githubRouter = new OpenAPIHono();

githubRouter.openapi(eventRoute, eventHandler);
