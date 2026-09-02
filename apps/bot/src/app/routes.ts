import { MessageFlags, TextChannel } from 'discord.js';
import { Hono } from 'hono';

import { ENV, logger } from '@core';
import { client } from '@discord';
import { ALLOWED_REPOSITORY, handleGitHubEvent } from '@features/github';
import type { GitHubWebhookPayload } from '@features/github';

export function registerRoutes(app: Hono): void {
	app.get('/', (c) => {
		return c.text('GitHub Discord Bot Engine is running!');
	});

	app.post('/webhook/github', async (c) => {
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

			const container = handleGitHubEvent(event, body);

			if (!container) {
				logger.debug(
					`Ignoring unsupported GitHub event: ${event ?? 'unknown'}`
				);

				return c.text('Event ignored', 200);
			}

			const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);

			if (!channel || !channel.isTextBased() || !('send' in channel)) {
				throw new Error('Configured Discord channel is unavailable.');
			}

			await (channel as TextChannel).send({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});

			return c.text('Webhook processed', 200);
		} catch (error) {
			logger.error('GitHub webhook processing failed:', error);

			return c.text(
				error instanceof Error
					? error.message
					: 'Internal server error',
				500
			);
		}
	});
}
