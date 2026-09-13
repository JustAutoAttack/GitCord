import { OpenAPIHono } from '@hono/zod-openapi';

import { githubRouter } from './github';

export const webhookRouter = new OpenAPIHono();

webhookRouter.route('/github', githubRouter);
