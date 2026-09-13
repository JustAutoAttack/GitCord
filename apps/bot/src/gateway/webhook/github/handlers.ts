import { RouteHandler } from '@hono/zod-openapi';
import { MessageFlags } from 'discord.js';

import { httpLogger } from '@core';
import { GitHubWebhookService } from '@features/github';
import { ServerAPIRemoteConfigService } from '@features/server';
import { client } from '@discord';
import { eventRoute } from './routes';

export const eventHandler: RouteHandler<typeof eventRoute> = async (ctx) => {
	const event = ctx.req.header('x-github-event');

	const body = await ctx.req.json().catch((error) => {
		httpLogger.error('Failed to parse GitHub webhook JSON:', error);
		return null;
	});

	if (!body) {
		return ctx.json(
			{ success: false, error: 'Failed to parse GitHub webhook JSON' },
			400
		);
	}

	const processed = GitHubWebhookService.parseWebhook(event, body);

	if (!processed) {
		return ctx.json({ success: true }, 200);
	}

	try {
		httpLogger.info(
			`Fetching repository configurations to match URL: ${processed.repositoryUrl}`
		);

		const response = await ServerAPIRemoteConfigService.list();
		const allConfigs = Array.isArray(response)
			? response
			: ((response as any)?.data ?? []);

		const matchingConfigs = allConfigs.filter(
			(config: any) => config.repositoryUrl === processed.repositoryUrl
		);

		if (matchingConfigs.length === 0) {
			httpLogger.warn(
				`No configuration found for repository: ${processed.repositoryUrl}`
			);
			return ctx.json({ success: true }, 200);
		}

		for (const config of matchingConfigs) {
			const targetChannelId = config.notificationChannelId;

			try {
				const channel = await client.channels.fetch(targetChannelId);

				if (
					!channel ||
					!channel.isTextBased() ||
					!('send' in channel)
				) {
					httpLogger.error(
						`Configured Discord channel ${targetChannelId} is unavailable.`
					);
					continue;
				}

				httpLogger.info(
					`Sending GitHub notification to Discord channel ${targetChannelId}...`
				);

				await channel.send({
					flags: MessageFlags.IsComponentsV2,
					components: [processed.container]
				});

				httpLogger.info(
					`GitHub notification sent successfully to channel ${targetChannelId}.`
				);
			} catch (channelError) {
				httpLogger.error(
					`Failed to send notification to channel ${targetChannelId}:`,
					channelError
				);
			}
		}

		return ctx.json({ success: true }, 200);
	} catch (error) {
		httpLogger.error('GitHub webhook processing failed:', error);

		return ctx.json(
			{ success: false, error: 'Failed to process GitHub webhook' },
			400
		);
	}
};
