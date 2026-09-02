import { ContainerBuilder, MessageFlags, TextChannel } from 'discord.js';
import { Hono } from 'hono';

import { ENV, logger } from '@core';
import { client } from '@discord';
import { ALLOWED_REPOSITORY } from '../constants';
import {
	handleCreateEvent,
	handleIssueEvent,
	handlePullRequestEvent,
	handlePushEvent,
	handleReleaseEvent
} from '../handlers';
import { GitHubWebhookPayload } from '../types';

export const webhookRouter = new Hono();

webhookRouter.post('/github', async (c) => {
	const event = c.req.header('x-github-event');

	const body = (await c.req
		.json()
		.catch(() => null)) as GitHubWebhookPayload | null;

	if (!body) {
		return c.text('Invalid JSON payload', 400);
	}

	try {
		const repository = body.repository?.full_name;

		if (repository && repository !== ALLOWED_REPOSITORY) {
			return c.text('Repository not allowed', 403);
		}

		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);

		if (!channel || !channel.isTextBased() || !('send' in channel)) {
			throw new Error('Configured Discord channel is unavailable.');
		}

		let container: ContainerBuilder | null = null;

		switch (event) {
			case 'push':
				container = handlePushEvent(body);
				break;

			case 'pull_request':
				container = handlePullRequestEvent(body);
				break;

			case 'issues':
				container = handleIssueEvent(body);
				break;

			case 'release':
				container = handleReleaseEvent(body);
				break;

			case 'create':
				container = handleCreateEvent(body);
				break;

			default:
				logger.debug(
					`Ignoring unsupported GitHub event: ${event ?? 'unknown'}`
				);

				return c.text('Event ignored', 200);
		}

		if (!container) {
			return c.text('Event ignored', 200);
		}

		await (channel as TextChannel).send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});

		return c.text('Webhook processed', 200);
	} catch (error) {
		logger.error('GitHub webhook processing failed:', error);

		return c.text(
			error instanceof Error ? error.message : 'Internal server error',
			500
		);
	}
});
