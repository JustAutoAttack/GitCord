import { OpenAPIHono } from '@hono/zod-openapi';
import { githubEventRoute, lifecycleRoute, tableUpdateRoute } from './routes';
import { githubEventHandler, lifecycleHandler, tableUpdateHandler } from './handlers';

export const serverRouter = new OpenAPIHono();

serverRouter.openapi(lifecycleRoute, lifecycleHandler);
serverRouter.openapi(tableUpdateRoute, tableUpdateHandler);
serverRouter.openapi(githubEventRoute, githubEventHandler);
