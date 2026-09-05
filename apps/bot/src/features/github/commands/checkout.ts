import {
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandSubcommandBuilder,
	TextDisplayBuilder
} from 'discord.js';

import {
	createContainer,
	buildHeader,
	buildFooter,
	addSeparator
} from '@shared';
import { rest_api } from '../services';

export const checkoutSubcommand = new SlashCommandSubcommandBuilder()
	.setName('checkout')
	.setDescription('Show repository or branch information')
	.addStringOption((option) =>
		option
			.setName('branch')
			.setDescription('Branch to check out')
			.setRequired(false)
	);

function getBranchName(
	interaction: ChatInputCommandInteraction
): string | null {
	const branch = interaction.options.getString('branch');

	if (!branch) {
		return null;
	}

	const trimmed = branch.trim();

	return trimmed.length > 0 ? trimmed : null;
}

async function getBranch(branchName: string) {
	const branches = await rest_api.getBranches();

	return branches.find((branch) => branch.name === branchName);
}

async function createBranchCheckout(
	repository: Awaited<ReturnType<typeof rest_api.getRepository>>,
	branchName: string
) {
	const branch = await getBranch(branchName);

	const container = createContainer(0x242429);

	if (!branch) {
		buildHeader(
			container,
			'Branch Not Found',
			`\`${repository.full_name}\``
		);

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`Branch \`${branchName}\` does not exist.`
			)
		);

		buildFooter(container, repository.full_name, repository.html_url);

		return container;
	}

	const commits = await rest_api.getCommits(branch.name);
	const latestCommit = commits[0];

	buildHeader(
		container,
		'Checkout',
		`\`${repository.full_name}\` · \`${branch.name}\``
	);

	addSeparator(container);

	if (!latestCommit) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				[
					`**Branch:** \`${branch.name}\``,
					'**Total commits:** `0`',
					'**Total contributors:** `0`',
					'',
					'No commits found on this branch.'
				].join('\n')
			)
		);
	} else {
		const contributors = new Set(
			commits
				.map((commit) => commit.author?.login)
				.filter((login): login is string => Boolean(login))
		);

		const sha = latestCommit.sha.substring(0, 7);

		const message =
			latestCommit.commit.message.split('\n')[0].trim() ||
			'No commit message';

		const author =
			latestCommit.commit.author?.name ??
			latestCommit.author?.login ??
			'Unknown';

		const username = latestCommit.author?.login;

		const date =
			latestCommit.commit.committer?.date ??
			latestCommit.commit.author?.date;

		const relativeTime = date
			? `<t:${Math.floor(new Date(date).getTime() / 1000)}:R>`
			: '';

		const commitDisplay = latestCommit.html_url
			? `[\`${sha}\`](${latestCommit.html_url})`
			: `\`${sha}\``;

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				[
					`**Branch:** \`${branch.name}\``,
					`**Total commits:** \`${commits.length}\``,
					`**Total contributors:** \`${contributors.size}\``,
					'',
					`**Latest commit:** ${commitDisplay}`,
					`**Message:** ${message}`,
					`**Author:** ${author}${username ? ` · @${username}` : ''}`,
					relativeTime
						? `**Updated:** ${relativeTime}`
						: '**Updated:** Unknown'
				].join('\n')
			)
		);
	}

	buildFooter(container, repository.full_name, repository.html_url);

	return container;
}

async function createRepositoryCheckout(
	repository: Awaited<ReturnType<typeof rest_api.getRepository>>
) {
	const [branches, commits, contributors] = await Promise.all([
		rest_api.getBranches(),
		rest_api.getCommits(),
		rest_api.getContributors()
	]);

	const container = createContainer(0x242429);

	buildHeader(
		container,
		'Repository Status',
		`Status for \`${repository.full_name}\``
	);

	if (branches.length === 0) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				[
					'**Main branch:** `Unknown`',
					'**Last edited branch:** `Unknown`',
					'**Total branches:** `0`',
					`**Total commits:** \`${commits.length}\``,
					`**Total contributors:** \`${contributors.length}\``,
					`**Size:** \`${repository.size ?? 0} KB\``,
					`**Created:** <t:${Math.floor(
						new Date(repository.created_at).getTime() / 1000
					)}:f>`
				].join('\n')
			)
		);

		buildFooter(container, repository.full_name, repository.html_url);

		return container;
	}

	const branchCommits = await Promise.all(
		branches.map(async (branch) => {
			const branchCommits = await rest_api.getCommits(branch.name);

			return {
				branch,
				commit: branchCommits[0]
			};
		})
	);

	const lastEditedBranch = branchCommits.reduce((latest, current) => {
		const currentDate = current.commit?.commit.committer?.date;

		const latestDate = latest?.commit?.commit.committer?.date;

		if (!currentDate) {
			return latest;
		}

		if (!latestDate) {
			return current;
		}

		return new Date(currentDate).getTime() > new Date(latestDate).getTime()
			? current
			: latest;
	}, branchCommits[0]);

	const createdTimestamp = Math.floor(
		new Date(repository.created_at).getTime() / 1000
	);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			[
				`**Main branch:** \`${repository.default_branch}\``,
				`**Last edited branch:** \`${lastEditedBranch?.branch.name ?? 'Unknown'}\``,
				`**Total branches:** \`${branches.length}\``,
				`**Total commits:** \`${commits.length}\``,
				`**Total contributors:** \`${contributors.length}\``,
				`**Size:** \`${repository.size ?? 0} KB\``,
				`**Created:** <t:${createdTimestamp}:f>`
			].join('\n')
		)
	);

	buildFooter(container, repository.full_name, repository.html_url);

	return container;
}

export async function executeCheckout(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	await interaction.deferReply();

	try {
		const repository = await rest_api.getRepository();
		const branchName = getBranchName(interaction);

		const container = branchName
			? await createBranchCheckout(repository, branchName)
			: await createRepositoryCheckout(repository);

		await interaction.editReply({
			flags: MessageFlags.IsComponentsV2,
			components: [container]
		});
	} catch (error) {
		console.error('Failed to fetch GitHub checkout data:', error);

		await interaction.editReply('Failed to fetch GitHub checkout data.');
	}
}
