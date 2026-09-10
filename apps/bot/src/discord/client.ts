import {
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	TextChannel
} from 'discord.js';

import { CONFIG, ENV, discordLogger } from '@core';
import {
	ServerAPIGuildSettingService,
	ServerAPIRemoteConfigService
} from '@server-api';
import { handleInteraction } from './handlers';

export const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

async function getNotificationChannels(): Promise<
	{ channel: TextChannel; guildId: string }[]
> {
	const results: { channel: TextChannel; guildId: string }[] = [];

	for (const guild of client.guilds.cache.values()) {
		try {
			const guildSettings =
				await ServerAPIGuildSettingService.getByGuildId(guild.id);
			const channelId = guildSettings?.systemChannelId;

			if (!channelId) {
				discordLogger.warn(
					`No system channel configured for guild: ${guild.id} (${guild.name})`
				);
				continue;
			}

			const channel = await client.channels.fetch(channelId);

			if (!channel || !channel.isTextBased() || !('send' in channel)) {
				discordLogger.warn(
					`Configured Discord channel is unavailable or cannot receive messages: ${channelId} (Guild: ${guild.id})`
				);
				continue;
			}

			results.push({
				channel: channel as TextChannel,
				guildId: guild.id
			});
		} catch (error) {
			discordLogger.warn(
				`Failed to fetch notification channel for guild ${guild.id}:`,
				error
			);
		}
	}

	return results;
}

client.once('clientReady', async (discordClient) => {
	discordLogger.info(`Connected to Discord as ${discordClient.user.tag}`);

	try {
		const targetChannels = await getNotificationChannels();

		if (targetChannels.length === 0) {
			return;
		}

		await Promise.all(
			targetChannels.map(async ({ channel, guildId }) => {
				try {
					let hasRepos = true;

					try {
						const response =
							await ServerAPIRemoteConfigService.list();
						const allConfigs = Array.isArray(response)
							? response
							: ((response as any)?.data ?? []);
						const serverConfigs = allConfigs.filter(
							(config: any) => config.guildId === guildId
						);
						if (serverConfigs.length === 0) {
							hasRepos = false;
						}
					} catch {
						hasRepos = false;
					}

					const descriptionLines = [];

					if (!hasRepos) {
						descriptionLines.push(
							'**No Repositories**: Run `/git remote add` to link a GitHub repository.'
						);
					}

					descriptionLines.push(
						'> Run `/git help` for a complete guide.'
					);

					const embed = new EmbedBuilder()
						.setColor(CONFIG.discord.colors.online)
						.setTitle('GitCord Online')
						.setDescription(descriptionLines.join('\n\n'));

					await channel.send({ embeds: [embed] });
				} catch (error) {
					discordLogger.error(
						`Failed to send online notification to channel ${channel.id}:`,
						error
					);
				}
			})
		);
	} catch (error) {
		discordLogger.error(
			'Failed to send Discord online notifications:',
			error
		);
	}
});

client.on('guildCreate', async (guild) => {
	discordLogger.info(`Joined new guild: ${guild.id} (${guild.name})`);

	try {
		const systemChannel = guild.systemChannel;
		if (!systemChannel || !systemChannel.isTextBased()) {
			return;
		}

		const descriptionLines = [
			'Thanks for adding GitCord! To set up this server for GitHub notifications, run `/git config server` in your desired channel.',
			'> Run `/git help` for a complete guide.'
		];

		const embed = new EmbedBuilder()
			.setColor(CONFIG.discord.colors.online)
			.setTitle('GitCord Setup')
			.setDescription(descriptionLines.join('\n\n'));

		await systemChannel.send({ embeds: [embed] });
	} catch (error) {
		discordLogger.error(
			`Failed to send welcome setup message for guild ${guild.id}:`,
			error
		);
	}
});

export async function connectDiscord(): Promise<void> {
	discordLogger.info('Connecting to Discord...');

	await client.login(ENV.DISCORD_BOT_TOKEN);
}

export async function disconnectDiscord(signal: string): Promise<void> {
	discordLogger.info(`Disconnecting from Discord after ${signal}...`);

	try {
		const targetChannels = await getNotificationChannels();

		if (targetChannels.length > 0) {
			const embed = new EmbedBuilder()
				.setColor(CONFIG.discord.colors.offline)
				.setTitle('System Update')
				.setDescription(`Shutting down (${signal}).`);

			await Promise.all(
				targetChannels.map(({ channel }) =>
					channel.send({ embeds: [embed] }).catch((error) => {
						discordLogger.error(
							`Failed to send offline notification to channel ${channel.id}:`,
							error
						);
					})
				)
			);
		}
	} catch (error) {
		discordLogger.error(
			'Failed to send Discord offline notifications:',
			error
		);
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
