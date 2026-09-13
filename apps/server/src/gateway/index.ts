import { OpenAPIHono } from '@hono/zod-openapi';

import { apiRouter } from './api';
import { webhookRouter } from './webhook';

export const gatewayRouter = new OpenAPIHono();

gatewayRouter.route('/api', apiRouter);
gatewayRouter.route('/webhook', webhookRouter);
