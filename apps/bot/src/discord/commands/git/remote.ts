import {
	ChatInputCommandInteraction,
	ChannelType,
	SlashCommandSubcommandGroupBuilder,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'Repository management must be done within a server.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'An error occurred while processing your request.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'Invalid channel configuration.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	let githubRepo: any = null;
	const cachedRepos =
		serverCacheService.getAll?.('github_repositories') ?? [];
	for (const cached of cachedRepos.values()) {
		if (cached.repositoryUrl === url) {
			githubRepo = cached;
			break;
		}
	}

	if (!githubRepo) {
		try {
			githubRepo =
				await ServerAPIGithubRepositoriesService.getByRepositoryUrl(
					url
				);
		} catch {
			githubRepo = null;
		}
	}

	if (!githubRepo) {
		logger.warn(
			`Attempted to link unindexed repository ${url} in server ${interaction.guildId}`
		);
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`### Repository Not Connected\nThe repository \`${url}\` is not connected to the bot. Please ensure the GitHub App is installed on this repository before adding it.`
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	let githubAppInstallationRecord: any = null;
	const githubAppInstallationID = githubRepo.githubAppInstallationId;

	if (githubAppInstallationID) {
		githubAppInstallationRecord = serverCacheService.get(
			'github_app_installations',
			githubAppInstallationID
		);
	}

	if (!githubAppInstallationRecord && githubAppInstallationID) {
		try {
			githubAppInstallationRecord =
				await ServerAPIGithubAppInstallationsService.getById(
					githubAppInstallationID
				);
		} catch (error) {
			logger.warn(
				`Failed to fetch GitHub app installation with ID ${githubAppInstallationID}:`,
				error
			);
		}
	}

	if (!githubAppInstallationRecord) {
		logger.warn(
			`Associated GitHub app installation record missing for repository ${url}`
		);
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Could not find the associated GitHub app installation for \`${url}\`.`
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
			const container = new ContainerBuilder().addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### Repository Already Linked\nThe repository \`${url}\` is already registered in this server.\n• Commands accepted in: <#${existingGuildRepo.commandChannelId}>\n• Notifications routed to: <#${existingGuildRepo.notificationChannelId}>`
				)
			);
			await interaction.reply({
				components: [container],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
	const successContainer = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`### Repository Added\nSubscribed to \`${url}\`.\n• Commands accepted in: <#${interaction.channelId}>\n• Notifications routed to: <#${notifChannel.id}>`
		)
	);
	await interaction.reply({
		components: [successContainer],
		flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'There are no GitHub repositories configured for this server.'
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	logger.debug(
		`Listing ${guildRepos.length} configured repositories for server ${interaction.guildId}`
	);
	let repoLines = '';

	for (const guildRepo of guildRepos) {
		let repoFullName = guildRepo.githubRepository?.repositoryFullName;
		let repoUrl = guildRepo.githubRepository?.repositoryUrl;

		if ((!repoFullName || !repoUrl) && guildRepo.githubRepositoryId) {
			const cachedRepo = serverCacheService.get(
				'github_repositories',
				guildRepo.githubRepositoryId
			);
			if (cachedRepo) {
				repoFullName = repoFullName || cachedRepo.repositoryFullName;
				repoUrl = repoUrl || cachedRepo.repositoryUrl;
			} else {
				try {
					const repoRecord =
						await ServerAPIGithubRepositoriesService.getById(
							guildRepo.githubRepositoryId
						);
					repoFullName =
						repoFullName || repoRecord?.repositoryFullName;
					repoUrl = repoUrl || repoRecord?.repositoryUrl;
				} catch {
					// Fallback handled below
				}
			}
		}

		const safeName = repoFullName ?? 'Unknown Repository';
		const displayLink = repoUrl
			? `[\`${safeName}\`](${repoUrl})`
			: `\`${safeName}\``;

		const createdAt = guildRepo.createdAt ?? guildRepo.updatedAt;
		const unixTimestamp = createdAt
			? Math.floor(new Date(createdAt).getTime() / 1000)
			: null;
		const timeDisplay = unixTimestamp ? `<t:${unixTimestamp}:R>` : null;

		repoLines += `• ${displayLink}${timeDisplay ? ` · ${timeDisplay}` : ''}\n`;
		if (isVerbose) {
			repoLines += `  ↳ **Commands:** <#${guildRepo.commandChannelId}>\n`;
			repoLines += `  ↳ **Notifications:** <#${guildRepo.notificationChannelId}>\n\n`;
		} else {
			repoLines += `  ↳ Commands: <#${guildRepo.commandChannelId}>\n`;
			repoLines += `  ↳ Notifications: <#${guildRepo.notificationChannelId}>\n\n`;
		}
	}

	const container = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`### Connected Repositories (${guildRepos.length})\n\n${repoLines.trim()}`
		)
	);

	await interaction.reply({
		components: [container],
		flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Could not find a subscription for \`${urlToRemove}\` in this server.`
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
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
		const container = new ContainerBuilder().addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Could not find a subscription for \`${urlToRemove}\` in this server.`
			)
		);
		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	await ServerAPIGuildRepositoriesService.delete(targetGuildRepo.id);

	logger.info(
		`Successfully removed repository subscription ${urlToRemove} (ID: ${targetGuildRepo.id}) from server ${interaction.guildId}`
	);
	const successContainer = new ContainerBuilder().addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`### Repository Removed\nUnsubscribed from \`${urlToRemove}\`.`
		)
	);
	await interaction.reply({
		components: [successContainer],
		flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
	});
}
