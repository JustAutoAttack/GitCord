import { OpenAPIHono } from '@hono/zod-openapi';
import { lifecycleRoute, tableUpdateRoute } from './routes';
import { lifecycleHandler, tableUpdateHandler } from './handlers';

export const serverRouter = new OpenAPIHono();

serverRouter.openapi(lifecycleRoute, lifecycleHandler);
serverRouter.openapi(tableUpdateRoute, tableUpdateHandler);
