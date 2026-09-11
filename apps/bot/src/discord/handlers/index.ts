import {
	Client,
	EmbedBuilder,
	TextChannel,
	type Guild,
	type ChatInputCommandInteraction
} from 'discord.js';

import { CONFIG, discordLogger } from '@core';
import {
    isServerOnline,
	ServerAPIGuildSettingService,
	ServerAPIRemoteConfigService
} from '@server-api';
import { handleInteraction } from './interaction';

let cachedNotificationChannels: { channel: TextChannel; guildId: string }[] =
	[];

export async function getNotificationChannels(
	client: Client
): Promise<{ channel: TextChannel; guildId: string }[]> {
	const results: { channel: TextChannel; guildId: string }[] = [];

	let allSettings: any[] = [];
	try {
		const response = await ServerAPIGuildSettingService.list();
		allSettings = Array.isArray(response)
			? response
			: ((response as any)?.data ?? []);
	} catch (error) {
		discordLogger.warn(
			'Failed to bulk-fetch guild settings from server, falling back to individual checks:',
			error
		);
	}

	const settingsMap = new Map<string, string>();
	for (const setting of allSettings) {
		if (setting?.guildId && setting?.systemChannelId) {
			settingsMap.set(setting.guildId, setting.systemChannelId);
		}
	}

	for (const guild of client.guilds.cache.values()) {
		try {
			let channelId = settingsMap.get(guild.id);

			if (!channelId) {
				try {
					const created = await ServerAPIGuildSettingService.create({
						guildId: guild.id,
						systemChannelId: guild.systemChannelId ?? ''
					});
					channelId = created?.systemChannelId;
				} catch {
					// Ignore creation failure if already exists or server error
				}
			}

			if (!channelId) {
				discordLogger.warn(
					`No system channel configured for guild: ${guild.id} (${guild.name})`
				);
				continue;
			}

			const channel = await client.channels.fetch(channelId);

			if (!channel || !channel.isTextBased() || !('send' in channel)) {
				discordLogger.warn(
					`Configured Discord channel unavailable: ${channelId} (Guild: ${guild.id})`
				);
				continue;
			}

			results.push({
				channel: channel as TextChannel,
				guildId: guild.id
			});
		} catch (error) {
			discordLogger.warn(
				`Failed to process notification channel for guild ${guild.id}:`,
				error
			);
		}
	}

	cachedNotificationChannels = results;
	return results;
}

export function getCachedNotificationChannels(): {
	channel: TextChannel;
	guildId: string;
}[] {
	return cachedNotificationChannels;
}

async function handleClientReady(discordClient: Client<true>): Promise<void> {
	discordLogger.info(`Connected to Discord as ${discordClient.user.tag}`);

	if (!(await isServerOnline())) {
		discordLogger.warn(
			'GitCord server is offline. Skipping initial channel notification sync.'
		);
		return;
	}

	try {
		const targetChannels = await getNotificationChannels(discordClient);

		if (targetChannels.length === 0) {
			return;
		}

		let allConfigs: any[] = [];
		try {
			const response = await ServerAPIRemoteConfigService.list();
			allConfigs = Array.isArray(response)
				? response
				: ((response as any)?.data ?? []);
		} catch {
			// Treat as empty if fetch fails
		}

		await Promise.all(
			targetChannels.map(async ({ channel, guildId }) => {
				try {
					const serverConfigs = allConfigs.filter(
						(config: any) => config.guildId === guildId
					);
					const hasRepos = serverConfigs.length > 0;

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
}

async function handleGuildCreate(guild: Guild): Promise<void> {
	discordLogger.info(`Joined new guild: ${guild.id} (${guild.name})`);

	try {
		await ServerAPIGuildSettingService.create({
			guildId: guild.id,
			systemChannelId: guild.systemChannelId ?? ''
		}).catch(() => {
			// Ignore if settings already exist
		});

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
}

async function handleInteractionCreate(interaction: any): Promise<void> {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	try {
		await handleInteraction(interaction as ChatInputCommandInteraction);
	} catch (error) {
		discordLogger.error(
			`Unhandled interaction error for ${interaction.commandName}:`,
			error
		);
	}
}

export function registerClientHandlers(client: Client): void {
	client.once('clientReady', (c) => {
		void handleClientReady(c);
	});

	client.on('guildCreate', (g) => {
		void handleGuildCreate(g);
	});

	client.on('interactionCreate', (i) => {
		void handleInteractionCreate(i);
	});
}
