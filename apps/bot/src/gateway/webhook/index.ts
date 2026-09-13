import { OpenAPIHono } from '@hono/zod-openapi';

import { githubRouter } from './github';
import { serverRouter } from './server';

export const webhookRouter = new OpenAPIHono();

// TODO Wrap server in middleware guard
webhookRouter.route('/server', serverRouter);
webhookRouter.route('/github', githubRouter);
