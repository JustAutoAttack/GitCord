import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	MessageFlags
} from 'discord.js';

import {
	ServerAPIGuildRepositoriesService,
	ServerAPIGithubRepositoriesService,
	ServerAPIGithubAppInstallationsService
} from '@features/server';
import { GitHubAPIService } from '@features/github';
import { logger } from '../../logger';

export const logSubcommand = new SlashCommandSubcommandBuilder()
	.setName('log')
	.setDescription('Display recent commit history from the default branch')
	.addIntegerOption((option) =>
		option
			.setName('count')
			.setDescription(
				'Number of commits to display (default: 3, max: 10)'
			)
			.setMinValue(1)
			.setMaxValue(10)
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
			githubRepo.repositoryUrl
		);

		const recentCommits = commits.slice(0, count);
		let output = `**Recent Commits (${recentCommits.length})**\n\n`;

		recentCommits.forEach((commit: any) => {
			const sha = commit.sha.substring(0, 7);
			const message = commit.commit.message.split('\n')[0];
			const author = commit.commit.author?.name ?? 'Unknown';
			output += `• \`${sha}\` - ${message} (*${author}*)\n`;
		});

		await interaction.editReply(output);
	} catch (error) {
		logger.error('[Git Log] Failed to fetch commit logs:', error);
		await interaction.editReply(
			'Failed to retrieve commit history from GitHub.'
		);
	}
}
