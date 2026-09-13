import { OpenAPIHono } from '@hono/zod-openapi';
import { fullHealthHandler, liveHandler, readyHandler } from './handlers';
import { fullHealthRoute, liveRoute, readyRoute } from './routes';

export const healthRouter = new OpenAPIHono();

healthRouter.openapi(liveRoute, liveHandler);
healthRouter.openapi(readyRoute, readyHandler);
healthRouter.openapi(fullHealthRoute, fullHealthHandler);
