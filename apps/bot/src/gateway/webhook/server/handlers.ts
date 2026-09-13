import type { RouteHandler } from '@hono/zod-openapi';

import { appLogger } from '@core';
import { webhookService } from '@services';
import type { lifecycleRoute, tableUpdateRoute } from './routes';
import type { ServerLifecyclePayload, TableUpdatePayload } from './schemas';

export const lifecycleHandler: RouteHandler<typeof lifecycleRoute> = async (
	ctx
) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = webhookService.verifyServerSignature(rawBody, signature);

	if (!signature || !isValid) {
		appLogger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as ServerLifecyclePayload;
	await webhookService.handleServerLifecycle(payload);

	return ctx.json({ success: true }, 200);
};

export const tableUpdateHandler: RouteHandler<typeof tableUpdateRoute> = async (
	ctx
) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = webhookService.verifyServerSignature(rawBody, signature);

	if (!signature || !isValid) {
		appLogger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as TableUpdatePayload;
	await webhookService.handleTableUpdate(payload);

	return ctx.json({ success: true }, 200);
};
