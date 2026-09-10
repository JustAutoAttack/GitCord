import { MessageFlags } from 'discord.js';
import { Hono } from 'hono';

import { appLogger } from '@core';
import { ServerAPIRepoConfigService } from '@server-api';
import { client } from '@discord';
import { handleGitHubEvent } from '@features/github';
import type { GitHubWebhookPayload } from '@features/github';

export function registerRoutes(app: Hono): void {
	app.get('/', (c) => {
		appLogger.info(`GET ${c.req.path}`);

		return c.text('GitHub Discord Bot Engine is running!');
	});

	app.post('/webhook/github', async (c) => {
		const event = c.req.header('x-github-event');

		appLogger.info(`Received GitHub webhook: ${event ?? 'unknown'}`);

		const body = (await c.req.json().catch((error) => {
			appLogger.error('Failed to parse GitHub webhook JSON:', error);

			return null;
		})) as GitHubWebhookPayload | null;

		if (!body) {
			appLogger.error('GitHub webhook contained no valid body.');

			return c.text('Invalid JSON payload', 400);
		}

		try {
			const repositoryUrl = body.repository?.html_url;
			const repositoryFullName = body.repository?.full_name;

			appLogger.info(
				`GitHub repository: ${repositoryFullName ?? 'unknown'}`
			);

			if (!repositoryUrl) {
				appLogger.warn(
					'Rejected webhook: Payload missing repository URL.'
				);
				return c.text('Repository URL missing', 400);
			}

			appLogger.info(
				`Fetching repository configurations to match URL: ${repositoryUrl}`
			);

			const response = await ServerAPIRepoConfigService.list();
			const allConfigs = Array.isArray(response)
				? response
				: ((response as any)?.data ?? []);

			const matchingConfigs = allConfigs.filter(
				(config: any) => config.repositoryUrl === repositoryUrl
			);

			if (matchingConfigs.length === 0) {
				appLogger.warn(
					`No configuration found for repository: ${repositoryUrl}`
				);
				return c.text('Repository not configured', 404);
			}

			appLogger.info(`Handling GitHub event: ${event ?? 'unknown'}`);

			const container = handleGitHubEvent(event, body);

			if (!container) {
				appLogger.debug(
					`Ignoring unsupported GitHub event: ${event ?? 'unknown'}`
				);

				return c.text('Event ignored', 200);
			}

			appLogger.info(
				'GitHub event successfully converted to Discord message.'
			);

			for (const config of matchingConfigs) {
				const targetChannelId = config.notificationChannelId;

				try {
					const channel =
						await client.channels.fetch(targetChannelId);

					if (
						!channel ||
						!channel.isTextBased() ||
						!('send' in channel)
					) {
						appLogger.error(
							`Configured Discord channel ${targetChannelId} is unavailable.`
						);
						continue;
					}

					appLogger.info(
						`Sending GitHub notification to Discord channel ${targetChannelId}...`
					);

					await channel.send({
						flags: MessageFlags.IsComponentsV2,
						components: [container]
					});

					appLogger.info(
						`GitHub notification sent successfully to channel ${targetChannelId}.`
					);
				} catch (channelError) {
					appLogger.error(
						`Failed to send notification to channel ${targetChannelId}:`,
						channelError
					);
				}
			}

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
		appLogger.warn(`404 ${c.req.method} ${c.req.path}`);

		return c.text('Not Found', 404);
	});
}
