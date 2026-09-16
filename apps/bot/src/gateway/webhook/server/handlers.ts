import type { RouteHandler } from '@hono/zod-openapi';
import type {
	ServerLifecycleWebhookPayload,
	TableUpdateWebhookPayload,
	GitHubEventWebhookPayload
} from '@gitcord/server-api';

import { ServerWebhookService } from '@features/server';
import { GitHubWebhookService } from '@features/github';
import type {
	lifecycleRoute,
	tableUpdateRoute,
	githubEventRoute
} from './routes';
import { logger } from '../logger';

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
		logger.warn('Received webhook with invalid or missing signature.');
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
		logger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as TableUpdateWebhookPayload;
	await ServerWebhookService.handleTableUpdate(payload);

	return ctx.json({ success: true }, 200);
};

export const githubEventHandler: RouteHandler<typeof githubEventRoute> = async (
	ctx
) => {
	const signature = ctx.req.header('X-GitCord-Signature');
	const rawBody = await ctx.req.text();

	const isValid = ServerWebhookService.verifyServerSignature(
		rawBody,
		signature
	);

	if (!signature || !isValid) {
		logger.warn('Received webhook with invalid or missing signature.');
		return ctx.json({ success: false, error: 'Invalid signature' }, 401);
	}

	const payload = JSON.parse(rawBody) as GitHubEventWebhookPayload;
	const githubEventName = ctx.req.header('X-GitHub-Event');

	await GitHubWebhookService.parseWebhook(
		githubEventName,
		payload.data.payload
	);

	return ctx.json({ success: true }, 200);
};
