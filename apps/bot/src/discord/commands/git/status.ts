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

export const statusSubcommand = new SlashCommandSubcommandBuilder()
	.setName('status')
	.setDescription(
		'Check CI/CD pipeline status, open PRs, issues, and platform health'
	);

export async function executeStatus(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	if (!interaction.guildId) {
		await interaction.reply({
			content: 'This command must be run within a server.',
			flags: [MessageFlags.Ephemeral]
		});
		return;
	}

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

		const repoData = await GitHubAPIService.getRepository(
			installationId,
			githubRepo.repositoryUrl
		);

		await interaction.editReply(
			`**Repository Status: \`${repoData.full_name}\`**\n` +
				`• Default Branch: \`${repoData.default_branch}\`\n` +
				`• Open Issues: \`${repoData.open_issues_count}\`\n` +
				`• Visibility: \`${repoData.private ? 'Private' : 'Public'}\``
		);
	} catch (error) {
		logger.error('[Git Status] Failed to fetch repository status:', error);
		await interaction.editReply(
			'Failed to fetch status from GitHub. Ensure the repository binding is correct.'
		);
	}
}
