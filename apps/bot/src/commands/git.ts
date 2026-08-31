import {
	ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder
} from 'discord.js';

interface GitHubAuthor {
	name?: string;
	email?: string;
	date?: string;
}

interface GitHubUser {
	login?: string;
	id?: number;
	avatar_url?: string;
	html_url?: string;
}

interface GitHubCommitInner {
	author?: GitHubAuthor;
	committer?: GitHubAuthor;
	message: string;
	tree?: {
		sha: string;
		url: string;
	};
	url?: string;
	comment_count?: number;
}

interface GitHubCommitResponse {
	sha: string;
	node_id?: string;
	commit: GitHubCommitInner;
	url?: string;
	html_url: string;
	comments_url?: string;
	author?: GitHubUser | null;
	committer?: GitHubUser | null;
	parents?: Array<{
		sha: string;
		url: string;
		html_url?: string;
	}>;
}

interface GitHubRepositoryResponse {
	full_name: string;
	html_url: string;
	default_branch: string;
	created_at: string;
	size?: number;
}

interface GitHubBranchResponse {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	protected?: boolean;
}

export const data = new SlashCommandBuilder()
	.setName('git')
	.setDescription(
		'Interact with your GitHub repository directly from Discord'
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('checkout')
			.setDescription('Fetch commit history for a specific branch')
			.addStringOption((option) =>
				option
					.setName('branch')
					.setDescription('Target branch name')
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName('author')
					.setDescription('Filter by GitHub username')
					.setRequired(false)
			)
			.addIntegerOption((option) =>
				option
					.setName('limit')
					.setDescription(
						'Number of commits to display (default: 5, max: 10)'
					)
					.setMinValue(1)
					.setMaxValue(10)
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('status')
			.setDescription('Check active repository status overview')
	);

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.substring(0, maxLength - 3)}...`;
}

export async function execute(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === 'checkout') {
		await interaction.deferReply();
		const branch = interaction.options.getString('branch', true);
		const authorFilter = interaction.options.getString('author');
		const limit = interaction.options.getInteger('limit') ?? 5;

		try {
			const url = `https://api.github.com/repos/JustAutoAttack/GitCord/commits?sha=${encodeURIComponent(branch)}`;
			const response = await fetch(url, {
				headers: { 'User-Agent': 'GitCord-Bot' }
			});

			if (!response.ok) {
				const container = new ContainerBuilder()
					.setAccentColor(0xda3633)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`**API Error**\nFailed to fetch logs from GitHub (Status code: \`${response.status}\`). Make sure the branch \`${branch}\` exists.`
						)
					);

				await interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container]
				});
				return;
			}

			let commits = (await response.json()) as GitHubCommitResponse[];

			if (authorFilter) {
				const query = authorFilter.toLowerCase().replace(/^@/, '');
				commits = commits.filter((c) => {
					const login = c.author?.login?.toLowerCase() ?? '';
					const email = c.commit?.author?.email?.toLowerCase() ?? '';
					return login.includes(query) || email.includes(query);
				});
			}

			if (!commits.length) {
				const container = new ContainerBuilder()
					.setAccentColor(0x30363d)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`**No Commits Found**\nNo commits found for branch \`${branch}\`${authorFilter ? ` matching username \`@${authorFilter.replace(/^@/, '')}\`` : ''}.`
						)
					);

				await interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container]
				});
				return;
			}

			const container = new ContainerBuilder().setAccentColor(0x2f81f7);

			const scopeText = [
				`Branch: \`${branch}\``,
				authorFilter
					? `Author: \`@${authorFilter.replace(/^@/, '')}\``
					: ''
			]
				.filter(Boolean)
				.join(' · ');

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### Branch Commits\n[JustAutoAttack/GitCord](https://github.com/JustAutoAttack/GitCord) · ${scopeText}`
				)
			);

			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);

			const topCommits = commits.slice(0, limit);
			for (let i = 0; i < topCommits.length; i++) {
				const c = topCommits[i];
				const sha = c.sha.substring(0, 7);
				const commitMessage = truncate(
					c.commit.message.split('\n')[0].trim(),
					140
				);

				const username =
					c.author?.login ?? c.commit.author?.name ?? 'unknown';

				const commitDate = c.commit.author?.date;
				const timestampTag = commitDate
					? `<t:${Math.floor(new Date(commitDate).getTime() / 1000)}:R>`
					: '';

				const shaDisplay = c.html_url
					? `[\`${sha}\`](${c.html_url})`
					: `\`${sha}\``;
				const metadata = timestampTag
					? `@${username}  ·  ${timestampTag}`
					: `@${username}`;

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`${shaDisplay}  **${commitMessage}**\n${metadata}`
					)
				);

				if (i < topCommits.length - 1) {
					container.addSeparatorComponents(
						new SeparatorBuilder().setSpacing(
							SeparatorSpacingSize.Small
						)
					);
				}
			}

			const unixTimestamp = Math.floor(Date.now() / 1000);
			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`[JustAutoAttack/GitCord](https://github.com/JustAutoAttack/GitCord)  ·  <t:${unixTimestamp}:f>`
				)
			);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		} catch (error) {
			console.error(error);
			const container = new ContainerBuilder()
				.setAccentColor(0xda3633)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						'**Execution Error**\nAn error occurred while communicating with the GitHub API.'
					)
				);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		}
	} else if (subcommand === 'status') {
		await interaction.deferReply({ ephemeral: true });

		try {
			const repoRes = await fetch(
				'https://api.github.com/repos/JustAutoAttack/GitCord',
				{ headers: { 'User-Agent': 'GitCord-Bot' } }
			);
			const branchesRes = await fetch(
				'https://api.github.com/repos/JustAutoAttack/GitCord/branches',
				{ headers: { 'User-Agent': 'GitCord-Bot' } }
			);
			const contributorsRes = await fetch(
				'https://api.github.com/repos/JustAutoAttack/GitCord/contributors?per_page=1',
				{ headers: { 'User-Agent': 'GitCord-Bot' } }
			);
			const commitsRes = await fetch(
				'https://api.github.com/repos/JustAutoAttack/GitCord/commits?per_page=1',
				{ headers: { 'User-Agent': 'GitCord-Bot' } }
			);

			if (!repoRes.ok || !branchesRes.ok) {
				throw new Error('Failed to fetch repository metadata.');
			}

			const repoData = (await repoRes.json()) as GitHubRepositoryResponse;
			const branchesData =
				(await branchesRes.json()) as GitHubBranchResponse[];
			const commitsData =
				(await commitsRes.json()) as GitHubCommitResponse[];

			const repoName = repoData.full_name;
			const repoUrl = repoData.html_url;
			const defaultBranch = repoData.default_branch;
			const createdAt = Math.floor(
				new Date(repoData.created_at).getTime() / 1000
			);
			const sizeKb = repoData.size ?? 0;
			const repoSize =
				sizeKb > 1024
					? `${(sizeKb / 1024).toFixed(1)} MB`
					: `${sizeKb} KB`;

			const branchCount = branchesData.length;
			const defaultBranchObj = branchesData.find(
				(b) => b.name === defaultBranch
			);
			const latestSha = defaultBranchObj
				? defaultBranchObj.commit.sha.substring(0, 7)
				: (commitsData[0]?.sha?.substring(0, 7) ?? '0000000');
			const latestShaUrl = defaultBranchObj
				? `https://github.com/${repoName}/commit/${defaultBranchObj.commit.sha}`
				: undefined;

			let contributorCount = '1+';
			const linkHeader = contributorsRes.headers.get('link');
			if (linkHeader) {
				const match = linkHeader.match(/page=(\d+)[^>]*>; rel="last"/);
				if (match && match[1]) contributorCount = match[1];
			} else if (contributorsRes.ok) {
				const list = (await contributorsRes.json()) as GitHubUser[];
				contributorCount = String(
					Array.isArray(list) ? list.length : 1
				);
			}

			const container = new ContainerBuilder().setAccentColor(0x238636);

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### Repository Status\nOverview of active statistics`
				)
			);

			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);

			const shaDisplay = latestShaUrl
				? `[\`${latestSha}\`](${latestShaUrl})`
				: `\`${latestSha}\``;

			const bodyContent = [
				`Default Branch: \`${defaultBranch}\``,
				`Latest Commit: ${shaDisplay}`,
				`Total Branches: \`${branchCount}\``,
				`Contributors: \`${contributorCount}\``,
				`Repository Size: \`${repoSize}\``,
				`Created At: <t:${createdAt}:f>`
			].join('\n');

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(bodyContent)
			);

			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);

			const unixTimestamp = Math.floor(Date.now() / 1000);
			const repoDisplay = repoUrl
				? `[${repoName}](${repoUrl})`
				: `\`${repoName}\``;

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${repoDisplay}  ·  <t:${unixTimestamp}:f>`
				)
			);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		} catch (error) {
			console.error(error);
			const container = new ContainerBuilder()
				.setAccentColor(0xda3633)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						'**Status Error**\nFailed to retrieve active repository statistics from GitHub.'
					)
				);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		}
	}
}
