import {
	Client,
	ContainerBuilder,
	GatewayIntentBits,
	MessageFlags,
	TextChannel,
	TextDisplayBuilder
} from 'discord.js';

import { CONFIG, ENV, logger } from '@core';
import { handleInteraction } from './handlers';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

async function getNotificationChannel(): Promise<TextChannel | null> {
	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);

		if (!channel || !channel.isTextBased() || !('send' in channel)) {
			logger.error(
				`Configured Discord channel is unavailable or cannot receive messages: ${ENV.DISCORD_CHANNEL_ID}`
			);

			return null;
		}

		return channel as TextChannel;
	} catch (error) {
		logger.error('Failed to fetch Discord notification channel:', error);

		return null;
	}
}

client.once('clientReady', async (discordClient) => {
	logger.info(`Connected to Discord as ${discordClient.user.tag}`);

	try {
		const channel = await getNotificationChannel();

		if (!channel) {
			return;
		}

		const container = new ContainerBuilder()
			.setAccentColor(CONFIG.colors.discordBotOnline)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'**Bot Engine Online**\nSystem is active, listening for changes, and tracking repository events.'
				)
			);

		await channel.send({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	} catch (error) {
		logger.error('Failed to send Discord online notification:', error);
	}
});

export async function connectDiscord(): Promise<void> {
	logger.info('Connecting to Discord...');

	await client.login(ENV.DISCORD_BOT_TOKEN);
}

export async function disconnectDiscord(signal: string): Promise<void> {
	logger.info(`Disconnecting from Discord after ${signal}...`);

	try {
		const channel = await getNotificationChannel();

		if (channel) {
			const container = new ContainerBuilder()
				.setAccentColor(CONFIG.colors.discordBotOffline)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**Bot Engine Offline**\nReceived system signal \`${signal}\`. Shutting down engine...`
					)
				);

			await channel.send({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		}
	} catch (error) {
		logger.error('Failed to send Discord offline notification:', error);
	} finally {
		client.destroy();
	}
}

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	try {
		await handleInteraction(interaction);
	} catch (error) {
		logger.error(
			`Unhandled interaction error for ${interaction.commandName}:`,
			error
		);
	}
});
