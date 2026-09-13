import { OpenAPIHono } from '@hono/zod-openapi';

import { apiRouter } from './api';

export const gatewayRouter = new OpenAPIHono();

gatewayRouter.route('/api', apiRouter);
