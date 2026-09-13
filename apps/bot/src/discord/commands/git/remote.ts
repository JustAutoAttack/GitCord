import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandGroupBuilder,
	MessageFlags
} from 'discord.js';

import {
	ServerAPIGithubAppInstallationsService,
	ServerAPIGithubRepositoriesService,
	ServerAPIGuildRepositoriesService,
	serverCacheService
} from '@features/server';
import { logger } from '../../logger';
import { COMMAND_DOCS } from '../constants';

export const remoteGroup = new SlashCommandSubcommandGroupBuilder()
	.setName('remote')
	.setDescription(COMMAND_DOCS['remote add'].description)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription(COMMAND_DOCS['remote add'].description)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription(
						'The GitHub repository URL (e.g., https://github.com/org/repo)'
					)
					.setRequired(true)
			)
			.addChannelOption((option) =>
				option
					.setName('notifications_channel')
					.setDescription(
						'Optional: Route events to a dedicated read-only channel'
					)
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('list')
			.setDescription(COMMAND_DOCS['remote list'].description)
			.addBooleanOption((option) =>
				option
					.setName('verbose')
					.setDescription('Show detailed channel routing (-v)')
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription(COMMAND_DOCS['remote remove'].description)
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription('The GitHub repository URL to remove')
					.setRequired(true)
			)
	);

export async function executeRemote(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId) {
		logger.warn(
			'Attempted to execute remote command outside of a server context.'
		);
		await interaction.reply({
			content: 'Repository management must be done within a server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	const subcommand = interaction.options.getSubcommand();
	logger.debug(
		`Executing /git remote ${subcommand} in guild ${interaction.guildId} by user ${interaction.user.id}`
	);

	try {
		switch (subcommand) {
			case 'add':
				await handleAdd(interaction);
				break;
			case 'list':
				await handleList(interaction);
				break;
			case 'remove':
				await handleRemove(interaction);
				break;
		}
	} catch (error) {
		logger.error(`[Git Remote] Failed to execute ${subcommand}:`, error);
		await interaction.reply({
			content: 'An error occurred while processing your request.',
			flags: [MessageFlags.Ephemeral]
		});
	}
}

async function handleAdd(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const url = interaction.options.getString('url', true);
	const notifChannel =
		interaction.options.getChannel('notifications_channel') ??
		interaction.channel;

	if (!notifChannel) {
		logger.warn(
			`Invalid channel configuration during /git remote add for repo ${url}`
		);
		await interaction.reply({
			content: 'Invalid channel configuration.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	// Fetch the repository row by URL
	let githubRepo: any;
	try {
		githubRepo =
			await ServerAPIGithubRepositoriesService.getByRepositoryUrl(url);
	} catch {
		githubRepo = null;
	}

	if (!githubRepo) {
		logger.warn(
			`Attempted to link unindexed repository ${url} in server ${interaction.guildId}`
		);
		await interaction.reply({
			content: `**Repository Not Connected**\nThe repository \`${url}\` is not connected to the bot. Please ensure the GitHub App is installed on this repository before adding it.`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	// Fetch the GitHub installation row using the installation foreign key reference
	let installationRecord: any;
	try {
		installationRecord =
			await ServerAPIGithubAppInstallationsService.getById(
				githubRepo.github_app_installation_id
			);
	} catch (error) {
		logger.warn(
			`Failed to fetch GitHub app installation with ID ${githubRepo.github_app_installation_id}:`,
			error
		);
	}

	if (!installationRecord) {
		logger.warn(
			`Associated GitHub app installation record missing for repository ${url}`
		);
		await interaction.reply({
			content: `Could not find the associated GitHub app installation for \`${url}\`.`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	try {
		const existingGuildRepo =
			await ServerAPIGuildRepositoriesService.getByGuildAndGithubRepository(
				interaction.guildId!,
				githubRepo.id
			);

		if (existingGuildRepo) {
			logger.warn(
				`Repository ${url} is already linked to server ${interaction.guildId}.`
			);
			await interaction.reply({
				content: `**Repository Already Linked**\nThe repository \`${url}\` is already registered in this server.\n• Commands accepted in: <#${existingGuildRepo.commandChannelId}>\n• Notifications routed to: <#${existingGuildRepo.notificationChannelId}>`,
				flags: [MessageFlags.Ephemeral]
			});
			return;
		}
	} catch (error) {
		logger.debug(
			'Failed to pre-check existing guild repositories during add, proceeding to create:',
			error
		);
	}

	await ServerAPIGuildRepositoriesService.create({
		guildId: interaction.guildId!,
		githubRepositoryId: githubRepo.id,
		commandChannelId: interaction.channelId,
		notificationChannelId: notifChannel.id
	});

	logger.info(
		`Successfully subscribed server ${interaction.guildId} to repository ${url}`
	);
	await interaction.reply({
		content: `**Repository Added**\nSubscribed to \`${url}\`.\n• Commands accepted in: <#${interaction.channelId}>\n• Notifications routed to: <#${notifChannel.id}>`,
		flags: [MessageFlags.Ephemeral]
	});
}

async function handleList(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const isVerbose = interaction.options.getBoolean('verbose') ?? false;

	const response = await ServerAPIGuildRepositoriesService.list(
		interaction.guildId!
	);
	const guildRepos = Array.isArray(response)
		? response
		: ((response as any)?.data ?? []);

	if (guildRepos.length === 0) {
		logger.debug(`No repositories found for server ${interaction.guildId}`);
		await interaction.reply({
			content:
				'There are no GitHub repositories configured for this server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	logger.debug(
		`Listing ${guildRepos.length} configured repositories for server ${interaction.guildId}`
	);
	let message = '**Connected Repositories**\n\n';

	for (const guildRepo of guildRepos) {
		let repoUrl = guildRepo.githubRepository?.repositoryUrl;
		if (!repoUrl && guildRepo.githubRepositoryId) {
			const cachedRepo = serverCacheService.get(
				'github_repositories',
				guildRepo.githubRepositoryId
			);
			if (cachedRepo) {
				repoUrl = cachedRepo.repositoryUrl;
			} else {
				try {
					const repoRecord =
						await ServerAPIGithubRepositoriesService.getById(
							guildRepo.githubRepositoryId
						);
					repoUrl = repoRecord?.repositoryUrl;
				} catch {
					repoUrl = 'Unknown URL';
				}
			}
		}

		message += `• **\`${repoUrl ?? 'Unknown URL'}\`**\n`;
		if (isVerbose) {
			message += `  ↳ **Commands:** <#${guildRepo.commandChannelId}>\n`;
			message += `  ↳ **Notifications:** <#${guildRepo.notificationChannelId}>\n\n`;
		} else {
			message += `  ↳ Commands: <#${guildRepo.commandChannelId}>\n`;
			message += `  ↳ Notifications: <#${guildRepo.notificationChannelId}>\n\n`;
		}
	}

	await interaction.reply({
		content: message.trim(),
		flags: [MessageFlags.Ephemeral]
	});
}

async function handleRemove(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const urlToRemove = interaction.options.getString('url', true);

	let githubRepo: any;
	try {
		githubRepo =
			await ServerAPIGithubRepositoriesService.getByRepositoryUrl(
				urlToRemove
			);
	} catch {
		// Not found
	}

	if (!githubRepo) {
		logger.warn(
			`Attempted to remove non-existent repository ${urlToRemove} in server ${interaction.guildId}`
		);
		await interaction.reply({
			content: `Could not find a subscription for \`${urlToRemove}\` in this server.`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	let targetGuildRepo: any;
	try {
		targetGuildRepo =
			await ServerAPIGuildRepositoriesService.getByGuildAndGithubRepository(
				interaction.guildId!,
				githubRepo.id
			);
	} catch (error) {
		logger.debug(
			`Could not find guild repository lookup for repo ${urlToRemove} in server ${interaction.guildId}`,
			error
		);
	}

	if (!targetGuildRepo) {
		logger.warn(
			`Attempted to remove non-existent repository subscription ${urlToRemove} in server ${interaction.guildId}`
		);
		await interaction.reply({
			content: `Could not find a subscription for \`${urlToRemove}\` in this server.`,
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	await ServerAPIGuildRepositoriesService.delete(targetGuildRepo.id);

	logger.info(
		`Successfully removed repository subscription ${urlToRemove} (ID: ${targetGuildRepo.id}) from server ${interaction.guildId}`
	);
	await interaction.reply({
		content: `**Repository Removed**\nUnsubscribed from \`${urlToRemove}\`.`,
		flags: [MessageFlags.Ephemeral]
	});
}
