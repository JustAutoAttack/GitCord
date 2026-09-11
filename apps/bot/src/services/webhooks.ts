import { appLogger, cryptoService, ENV, CONFIG } from '@core';
import { handleGitHubWebhook } from '@features/github';
import { EmbedBuilder } from 'discord.js';
import {
	getNotificationChannels,
	getCachedNotificationChannels,
	client
} from '@discord';

export class WebhookService {
	verifyServerSignature(
		rawBody: string,
		signature: string | undefined
	): boolean {
		if (!signature) {
			return false;
		}

		return cryptoService.verifyHmacSha256(
			ENV.SERVER_WEBHOOK_SECRET,
			rawBody,
			signature
		);
	}

	async handleServerLifecycle(payload: {
		type: string;
		data: { status: string; reason?: string };
	}): Promise<void> {
		if (payload.type === 'SERVER_LIFECYCLE') {
			appLogger.info(
				`Server lifecycle event received: ${payload.data.status} (${payload.data.reason ?? 'No reason provided'})`
			);

			if (payload.data.status === 'OFFLINE') {
				try {
					const targetChannels =
						getCachedNotificationChannels().length > 0
							? getCachedNotificationChannels()
							: await getNotificationChannels(client);

					if (targetChannels.length > 0) {
						const embed = new EmbedBuilder()
							.setColor(CONFIG.discord.colors.offline)
							.setTitle('GitCord Server Offline')
							.setDescription(
								`The API server has gone offline.\n> **Reason**: ${payload.data.reason ?? 'Server shutdown'}`
							);

						await Promise.all(
							targetChannels.map(({ channel }) =>
								channel
									.send({ embeds: [embed] })
									.catch((error) => {
										appLogger.error(
											`Failed to send server offline notification to channel ${channel.id}:`,
											error
										);
									})
							)
						);
					}
				} catch (error) {
					appLogger.error(
						'Failed to broadcast server offline notification to Discord channels:',
						error
					);
				}
			} else if (payload.data.status === 'ONLINE') {
				try {
					const targetChannels =
						await getNotificationChannels(client);

					if (targetChannels.length > 0) {
						const embed = new EmbedBuilder()
							.setColor(CONFIG.discord.colors.online)
							.setTitle('GitCord Server Online')
							.setDescription(
								'The API server has successfully connected and is back online.'
							);

						await Promise.all(
							targetChannels.map(({ channel }) =>
								channel
									.send({ embeds: [embed] })
									.catch((error) => {
										appLogger.error(
											`Failed to send server online notification to channel ${channel.id}:`,
											error
										);
									})
							)
						);
					}
				} catch (error) {
					appLogger.error(
						'Failed to broadcast server online notification to Discord channels:',
						error
					);
				}
			}
		}
	}

	async processGitHubWebhook(ctx: any): Promise<void> {
		await handleGitHubWebhook(ctx);
	}
}

export const webhookService = new WebhookService();
