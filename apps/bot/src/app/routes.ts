import { MessageFlags } from 'discord.js';
import { Hono } from 'hono';

import { ENV, logger } from '@core';
import { client } from '@discord';
import { ALLOWED_REPOSITORY, handleGitHubEvent } from '@features/github';
import type { GitHubWebhookPayload } from '@features/github';

export function registerRoutes(app: Hono): void {
	app.get('/', (c) => {
		logger.info(`GET ${c.req.path}`);

		return c.text('GitHub Discord Bot Engine is running!');
	});

	app.post('/webhook/github', async (c) => {
		const event = c.req.header('x-github-event');

		logger.info(`Received GitHub webhook: ${event ?? 'unknown'}`);

		const body = (await c.req.json().catch((error) => {
			logger.error('Failed to parse GitHub webhook JSON:', error);

			return null;
		})) as GitHubWebhookPayload | null;

		if (!body) {
			logger.error('GitHub webhook contained no valid body.');

			return c.text('Invalid JSON payload', 400);
		}

		try {
			const repository = body.repository?.full_name;

			logger.info(`GitHub repository: ${repository ?? 'unknown'}`);

			if (repository && repository !== ALLOWED_REPOSITORY) {
				logger.warn(
					`Rejected repository: ${repository}. Expected: ${ALLOWED_REPOSITORY}`
				);

				return c.text('Repository not allowed', 403);
			}

			logger.info(`Handling GitHub event: ${event ?? 'unknown'}`);

			const container = handleGitHubEvent(event, body);

			if (!container) {
				logger.debug(
					`Ignoring unsupported GitHub event: ${event ?? 'unknown'}`
				);

				return c.text('Event ignored', 200);
			}

			logger.info(
				'GitHub event successfully converted to Discord message.'
			);

			const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);

			if (!channel || !channel.isTextBased() || !('send' in channel)) {
				throw new Error('Configured Discord channel is unavailable.');
			}

			logger.info(
				`Sending GitHub notification to Discord channel ${ENV.DISCORD_CHANNEL_ID}...`
			);

			await channel.send({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});

			logger.info('GitHub notification sent successfully.');

			return c.text('Webhook processed', 200);
		} catch (error) {
			console.error('GitHub webhook processing failed:', error);

			if (error instanceof Error) {
				console.error(error.stack);
			}

			return c.text(
				error instanceof Error
					? error.message
					: 'Internal server error',
				500
			);
		}
	});

	app.all('*', (c) => {
		logger.warn(`404 ${c.req.method} ${c.req.path}`);

		return c.text('Not Found', 404);
	});
}
