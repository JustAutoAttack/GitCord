import type { RouteHandler } from '@hono/zod-openapi';

import { appLogger } from '@core';
import { webhookService } from '@services';
import type { serverWebhookRoute, githubWebhookRoute } from './routes';

export const handleServerWebhook: RouteHandler<
	typeof serverWebhookRoute
> = async (ctx) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = webhookService.verifyServerSignature(rawBody, signature);

	if (!signature || !isValid) {
		appLogger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody);
	webhookService.handleServerLifecycle(payload);

	return ctx.json({ success: true }, 200);
};

export const handleGitHubRoute: RouteHandler<
	typeof githubWebhookRoute
> = async (ctx) => {
	await webhookService.processGitHubWebhook(ctx as any);
	return ctx.json({ success: true }, 200);
};
