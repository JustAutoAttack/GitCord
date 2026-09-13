import { OpenAPIHono } from '@hono/zod-openapi';

import { healthRouter } from './health';

export const apiRouter = new OpenAPIHono();

apiRouter.route('/health', healthRouter);
