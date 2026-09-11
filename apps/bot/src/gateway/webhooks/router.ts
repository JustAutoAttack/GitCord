import { OpenAPIHono } from '@hono/zod-openapi';

import { handleServerWebhook, handleGitHubRoute } from './controller';
import { serverWebhookRoute, githubWebhookRoute } from './routes';

export const webhooksRouter = new OpenAPIHono();

webhooksRouter.openapi(serverWebhookRoute, handleServerWebhook);
webhooksRouter.openapi(githubWebhookRoute, handleGitHubRoute);
