import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize
} from 'discord.js';

import {
	ServerAPIGuildRepositoriesService,
	ServerAPIGithubRepositoriesService,
	ServerAPIGithubAppInstallationsService
} from '@features/server';
import { GitHubAPIService } from '@features/github';
import { CONFIG } from '@core';
import { logger } from '../../logger';
import { discordRelativeTimestamp } from '@features/github/webhook/utils';

const MAX_COMMIT_MESSAGE_LENGTH = 72;

export const logSubcommand = new SlashCommandSubcommandBuilder()
	.setName('log')
	.setDescription('Display recent commit history')
	.addIntegerOption((option) =>
		option
			.setName('count')
			.setDescription(
				'Number of commits to display (default: 3, max: 10)'
			)
			.setMinValue(1)
			.setMaxValue(10)
			.setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('branch')
			.setDescription('The branch name to fetch commits from (optional)')
			.setRequired(false)
	);

export async function executeLog(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId) {
		await interaction.reply({
			content: 'This command must be run within a server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

	const count = interaction.options.getInteger('count') ?? 3;
	const branch = interaction.options.getString('branch') ?? undefined;
	await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

	try {
		const response = await ServerAPIGuildRepositoriesService.list(
			interaction.guildId
		);
		const guildRepos = Array.isArray(response)
			? response
			: ((response as any)?.data ?? []);

		const targetGuildRepo = guildRepos.find(
			(repo: any) =>
				repo.commandChannelId === interaction.channelId ||
				repo.notificationChannelId === interaction.channelId
		);

		if (!targetGuildRepo) {
			await interaction.editReply(
				'No repository is bound to this channel. Use `/git remote add <url>` first.'
			);
			return;
		}

		const githubRepoId = targetGuildRepo.githubRepositoryId;
		let githubRepo: any;
		try {
			githubRepo =
				await ServerAPIGithubRepositoriesService.getById(githubRepoId);
		} catch (error) {
			logger.error(
				`Failed to fetch GitHub repository details for ID ${githubRepoId}:`,
				error
			);
			await interaction.editReply(
				'Failed to retrieve repository details from the server registry.'
			);
			return;
		}

		if (!githubRepo) {
			await interaction.editReply(
				'Associated GitHub repository record not found.'
			);
			return;
		}

		let installationRecord: any;
		try {
			installationRecord =
				await ServerAPIGithubAppInstallationsService.getById(
					githubRepo.githubAppInstallationId
				);
		} catch (error) {
			logger.error(
				`Failed to fetch installation record for ID ${githubRepo.githubAppInstallationId}:`,
				error
			);
			await interaction.editReply(
				'Failed to retrieve GitHub app installation details.'
			);
			return;
		}

		const installationId = installationRecord?.installationId ?? 123456;
		const commits = await GitHubAPIService.getCommits(
			installationId,
			githubRepo.repositoryUrl,
			branch
		);

		const recentCommits = commits.slice(0, count);

		const commitLines = recentCommits.map((commit: any) => {
			const sha = commit.sha.substring(0, 7);
			const message =
				commit.commit.message.split('\n')[0]?.trim() ||
				'No commit message';
			const maxLength = MAX_COMMIT_MESSAGE_LENGTH;

			const truncatedMessage =
				message.length > maxLength
					? `${message.substring(0, maxLength - 3)}...`
					: message;

			const authorName = commit.commit.author?.name ?? 'Unknown';
			const commitDate =
				commit.commit.author?.date ?? commit.commit.committer?.date;
			const unixTimestamp = commitDate
				? Math.floor(new Date(commitDate).getTime() / 1000)
				: null;
			const timeDisplay = unixTimestamp ? `<t:${unixTimestamp}:R>` : null;

			const shaDisplay = commit.html_url
				? `[\`${sha}\`](${commit.html_url})`
				: `\`${sha}\``;

			return [
				`### ${shaDisplay} ${truncatedMessage}`,
				`-# ${authorName}${timeDisplay ? ` · ${timeDisplay}` : ''}`
			].join('\n');
		});

		const commitContent =
			commitLines.length > 0
				? commitLines
						.join('\n\n')
						.split('\n')
						.map((line) => `> ${line}`)
						.join('\n')
				: '> No commits found.';

		const footerDisplay = githubRepo.repositoryFullName
			? `${githubRepo.repositoryFullName}  ·  <t:${Math.floor(Date.now() / 1000)}:f>`
			: null;

		const container = new ContainerBuilder()
			.setAccentColor(CONFIG.github.colors.push)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### Commits${branch ? `: \`${branch}\`` : ''}\n${recentCommits.length} Commit${recentCommits.length === 1 ? '' : 's'}`
				)
			)
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(commitContent)
			);

		if (footerDisplay) {
			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerDisplay)
			);
		}

		await interaction.editReply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
	} catch (error) {
		logger.error('[Git Log] Failed to fetch commit logs:', error);
		await interaction.editReply(
			'Failed to retrieve commit history from GitHub.'
		);
	}
}
