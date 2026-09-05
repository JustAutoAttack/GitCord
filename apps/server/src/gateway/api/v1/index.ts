import { OpenAPIHono } from '@hono/zod-openapi';

import { repoConfigsRouter } from './repo_configs';

export const v1Router = new OpenAPIHono();

v1Router.route('/repo-configs', repoConfigsRouter);
