import {
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel
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

		const embed = new EmbedBuilder()
			.setColor(CONFIG.colors.discordBotOnline)
			.setTitle('System Update')
			.setDescription('System ready.');

		await channel.send({
			embeds: [embed]
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
			const embed = new EmbedBuilder()
				.setColor(CONFIG.colors.discordBotOffline)
				.setTitle('System Update')
				.setDescription(`Shutting down (${signal}).`);

			await channel.send({
				embeds: [embed]
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
