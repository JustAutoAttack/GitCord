import {
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel
} from 'discord.js';

import { CONFIG, ENV, discordLogger } from '@core';
import { handleInteraction } from './handlers';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

async function getNotificationChannel(): Promise<TextChannel | null> {
	try {
		const channel = await client.channels.fetch(ENV.DISCORD_CHANNEL_ID);

		if (!channel || !channel.isTextBased() || !('send' in channel)) {
			discordLogger.error(
				`Configured Discord channel is unavailable or cannot receive messages: ${ENV.DISCORD_CHANNEL_ID}`
			);

			return null;
		}

		return channel as TextChannel;
	} catch (error) {
		discordLogger.error('Failed to fetch Discord notification channel:', error);

		return null;
	}
}

client.once('clientReady', async (discordClient) => {
	discordLogger.info(`Connected to Discord as ${discordClient.user.tag}`);

	try {
		const channel = await getNotificationChannel();

		if (!channel) {
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(CONFIG.discord.colors.online)
			.setTitle('System Update')
			.setDescription('System ready.');

		await channel.send({
			embeds: [embed]
		});
	} catch (error) {
		discordLogger.error('Failed to send Discord online notification:', error);
	}
});

export async function connectDiscord(): Promise<void> {
	discordLogger.info('Connecting to Discord...');

	await client.login(ENV.DISCORD_BOT_TOKEN);
}

export async function disconnectDiscord(signal: string): Promise<void> {
	discordLogger.info(`Disconnecting from Discord after ${signal}...`);

	try {
		const channel = await getNotificationChannel();

		if (channel) {
			const embed = new EmbedBuilder()
				.setColor(CONFIG.discord.colors.offline)
				.setTitle('System Update')
				.setDescription(`Shutting down (${signal}).`);

			await channel.send({
				embeds: [embed]
			});
		}
	} catch (error) {
		discordLogger.error('Failed to send Discord offline notification:', error);
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
		discordLogger.error(
			`Unhandled interaction error for ${interaction.commandName}:`,
			error
		);
	}
});
