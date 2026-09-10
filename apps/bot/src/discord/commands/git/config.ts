import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandGroupBuilder,
	MessageFlags,
	PermissionFlagsBits
} from 'discord.js';

import { ServerAPIGuildSettingService } from '@server-api';
import { discordLogger } from '@core';
import { COMMAND_DOCS } from '../constants';

export const configGroup = new SlashCommandSubcommandGroupBuilder()
	.setName('config')
	.setDescription('Configure server, bot preferences, and event routing')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('server')
			.setDescription(COMMAND_DOCS['config server'].description)
			.addChannelOption((option) =>
				option
					.setName('system_channel')
					.setDescription(
						'Default channel for server-wide GitCord notifications and alerts'
					)
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false)
			)
	);

// .addSubcommand((subcommand) =>
// 	subcommand
// 		.setName('bot')
// 		.setDescription(COMMAND_DOCS['config bot'].description)
// 		.addStringOption((option) =>
// 			option
// 				.setName('nickname')
// 				.setDescription(
// 					'Change the bot display name for this server (leave blank to reset)'
// 				)
// 				.setRequired(false)
// 		)
// )
// .addSubcommand((subcommand) =>
// 	subcommand
// 		.setName('events')
// 		.setDescription(COMMAND_DOCS['config events'].description)
// 		.addBooleanOption((option) =>
// 			option
// 				.setName('pull_requests')
// 				.setDescription('Enable or disable Pull Request alerts')
// 				.setRequired(false)
// 		)
// 		.addBooleanOption((option) =>
// 			option
// 				.setName('issues')
// 				.setDescription('Enable or disable Issue tracking alerts')
// 				.setRequired(false)
// 		)
// 		.addBooleanOption((option) =>
// 			option
// 				.setName('ci_checks')
// 				.setDescription(
// 					'Enable or disable GitHub Actions CI/CD status alerts'
// 				)
// 				.setRequired(false)
// 		)

export async function executeConfig(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId || !interaction.inGuild() || !interaction.guild) {
		discordLogger.warn(
			'Attempted to execute config command outside of a server context.'
		);
		await interaction.reply({
			content: 'Server configuration must be done within a server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	// TODO: Use proper auth with our server
	if (
		interaction.guild.ownerId !== interaction.user.id &&
		!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
	) {
		discordLogger.warn(
			`User ${interaction.user.id} attempted to configure server ${interaction.guildId} without permissions.`
		);
		await interaction.reply({
			content:
				'You must be the server owner or an administrator to configure server settings.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	const subcommand = interaction.options.getSubcommand();
	discordLogger.debug(
		`Executing /git config ${subcommand} in guild ${interaction.guildId} by user ${interaction.user.id}`
	);

	try {
		switch (subcommand) {
			case 'server':
				await handleServerConfig(interaction);
				break;
			// case 'bot':
			// 	await handleBotConfig(interaction);
			// 	break;
			// case 'events':
			// 	await handleEventsConfig(interaction);
			// 	break;
			default:
				await interaction.reply({
					content: 'Unknown configuration subcommand.',
					flags: [MessageFlags.Ephemeral]
				});
		}
	} catch (error) {
		discordLogger.error(
			`[Git Config] Failed to execute ${subcommand}:`,
			error
		);
		await interaction.reply({
			content:
				'An error occurred while processing your server configuration request.',
			flags: [MessageFlags.Ephemeral]
		});
	}
}

async function handleServerConfig(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const systemChannel = interaction.options.getChannel('system_channel');
	const systemChannelId = systemChannel
		? systemChannel.id
		: interaction.channelId;
	const guildId = interaction.guildId!;

	let setting;
	try {
		setting = await ServerAPIGuildSettingService.getByGuildId(guildId);
	} catch {
		// Not found or network error, will fall back to creation
	}

	if (setting) {
		await ServerAPIGuildSettingService.update(setting.id, {
			systemChannelId
		});
		discordLogger.info(
			`Successfully updated server configuration for guild ${guildId}. System channel set to ${systemChannelId}`
		);
		await interaction.reply({
			content: `**Server Configuration Updated**\nSystem notification channel set to <#${systemChannelId}>.`,
			flags: [MessageFlags.Ephemeral]
		});
	} else {
		await ServerAPIGuildSettingService.create({
			guildId,
			systemChannelId
		});
		discordLogger.info(
			`Successfully completed initial server setup for guild ${guildId}. System channel set to ${systemChannelId}`
		);
		await interaction.reply({
			content: `**Initial Server Setup Complete**\nSystem notification channel set to <#${systemChannelId}>.`,
			flags: [MessageFlags.Ephemeral]
		});
	}
}

// async function handleBotConfig(
// 	interaction: ChatInputCommandInteraction
// ): Promise<void> {
// 	const nickname = interaction.options.getString('nickname');
// 	const guild = interaction.guild!;

// 	try {
// 		const me = guild.members.me ?? (await guild.members.fetchMe());
// 		await me.setNickname(nickname || null);

// 		discordLogger.info(
// 			`Successfully updated bot nickname in guild ${guild.id} to: ${nickname || 'Default'}`
// 		);
// 		await interaction.reply({
// 			content: `**Bot Profile Updated**\nServer nickname changed to: \`${nickname || 'Default (Reset)'}\``,
// 			flags: [MessageFlags.Ephemeral]
// 		});
// 	} catch (error) {
// 		discordLogger.error(
// 			`Failed to update bot nickname in guild ${guild.id}:`,
// 			error
// 		);
// 		await interaction.reply({
// 			content:
// 				'Failed to update bot nickname. Ensure the bot has the **Change Nickname** permission and an appropriate role hierarchy.',
// 			flags: [MessageFlags.Ephemeral]
// 		});
// 	}
// }

// async function handleEventsConfig(
// 	interaction: ChatInputCommandInteraction
// ): Promise<void> {
// 	const prs = interaction.options.getBoolean('pull_requests');
// 	const issues = interaction.options.getBoolean('issues');
// 	const ci = interaction.options.getBoolean('ci_checks');

// 	// If no flags were passed, inspect current or report status
// 	if (prs === null && issues === null && ci === null) {
// 		await interaction.reply({
// 			content:
// 				'**Event Filters Status**\nUse options like `pull_requests:true` or `ci_checks:false` to modify event streams.',
// 			flags: [MessageFlags.Ephemeral]
// 		});
// 		return;
// 	}

// 	const updates: string[] = [];
// 	if (prs !== null)
// 		updates.push(`• Pull Requests: \`${prs ? 'Enabled' : 'Disabled'}\``);
// 	if (issues !== null)
// 		updates.push(`• Issues: \`${issues ? 'Enabled' : 'Disabled'}\``);
// 	if (ci !== null)
// 		updates.push(`• CI/CD Checks: \`${ci ? 'Enabled' : 'Disabled'}\``);

// 	discordLogger.info(
// 		`Updated event filters in guild ${interaction.guildId}: prs=${prs}, issues=${issues}, ci=${ci}`
// 	);

// 	await interaction.reply({
// 		content: `**Event Filters Updated**\n${updates.join('\n')}`,
// 		flags: [MessageFlags.Ephemeral]
// 	});
// }
