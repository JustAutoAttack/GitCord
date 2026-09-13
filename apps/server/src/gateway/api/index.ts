import { OpenAPIHono } from '@hono/zod-openapi';

import { healthRouter } from './health';
import { v1Router } from './v1';

export const apiRouter = new OpenAPIHono();

apiRouter.route('/health', healthRouter);
apiRouter.route('/v1', v1Router);
