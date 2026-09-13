import type { RouteHandler } from '@hono/zod-openapi';
import {
	ServerLifecycleWebhookPayload,
	TableUpdateWebhookPayload
} from '@gitcord/server-api';

import { httpLogger } from '@core';
import { ServerWebhookService } from '@features/server';
import type { lifecycleRoute, tableUpdateRoute } from './routes';

export const lifecycleHandler: RouteHandler<typeof lifecycleRoute> = async (
	ctx
) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = ServerWebhookService.verifyServerSignature(
		rawBody,
		signature
	);

	if (!signature || !isValid) {
		httpLogger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as ServerLifecycleWebhookPayload;
	await ServerWebhookService.handleServerLifecycle(payload);

	return ctx.json({ success: true }, 200);
};

export const tableUpdateHandler: RouteHandler<typeof tableUpdateRoute> = async (
	ctx
) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = ServerWebhookService.verifyServerSignature(
		rawBody,
		signature
	);

	if (!signature || !isValid) {
		httpLogger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as TableUpdateWebhookPayload;
	await ServerWebhookService.handleTableUpdate(payload);

	return ctx.json({ success: true }, 200);
};
