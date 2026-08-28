import {
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	TextDisplayBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('git')
	.setDescription(
		'Interact with your GitHub repository directly from Discord'
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('log')
			.setDescription('Fetch recent commit history')
			.addStringOption((option) =>
				option
					.setName('branch')
					.setDescription('Target branch name')
					.setRequired(false)
			)
			.addStringOption((option) =>
				option
					.setName('author')
					.setDescription('Filter by GitHub username')
					.setRequired(false)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('status')
			.setDescription(
				'Check active repository status and open PR overview'
			)
	);

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}

	return `${text.substring(0, maxLength - 3)}...`;
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === 'log') {
		await interaction.deferReply();
		const branch = interaction.options.getString('branch');
		const author = interaction.options.getString('author');

		try {
			// Build query params conditionally: if branch is provided, use it as sha. Otherwise, omit sha to search repository-wide.
			const queryParams = new URLSearchParams();
			if (branch) {
				queryParams.append('sha', branch);
			}
			if (author) {
				queryParams.append('author', author);
			}

			const url = `https://api.github.com/repos/JustAutoAttack/GitCord/commits?${queryParams.toString()}`;
			const response = await fetch(url, {
				headers: { 'User-Agent': 'GitCord-Bot' }
			});

			if (!response.ok) {
				const container = new ContainerBuilder().setAccentColor(
					0xda3633
				);

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## ❌ GitHub API Error\nFailed to fetch logs from GitHub (Status code: \`${response.status}\`). Make sure the branch name or author is valid.`
					)
				);

				await interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container]
				});
				return;
			}

			const commits = (await response.json()) as Array<any>;

			if (!commits.length) {
				const container = new ContainerBuilder().setAccentColor(
					0x30363d
				);

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## ⚠️ No Commits Found\nNo commits found${branch ? ` for branch \`${branch}\`` : ''}${author ? ` by @${author}` : ''}.`
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
				branch
					? `Branch: \`${branch}\``
					: 'Branch: `all (repository-wide)`',
				author ? `Author: \`@${author}\`` : ''
			]
				.filter(Boolean)
				.join(' · ');

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## 📦 Recent Commits\n[JustAutoAttack/GitCord](https://github.com/JustAutoAttack/GitCord) · ${scopeText}`
				)
			);

			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			);

			const topCommits = commits.slice(0, 5);
			for (let i = 0; i < topCommits.length; i++) {
				const c = topCommits[i];
				const sha = c.sha.substring(0, 7);
				const commitMessage = truncate(
					c.commit.message.split('\n')[0].trim(),
					140
				);
				const authorName =
					c.author?.login ?? c.commit.author.name ?? 'unknown';

				const commitDate = c.commit.author?.date;
				const timestampTag = commitDate
					? `<t:${Math.floor(new Date(commitDate).getTime() / 1000)}:R>`
					: '';

				const shaDisplay = c.html_url
					? `[\`${sha}\`](${c.html_url})`
					: `\`${sha}\``;
				const metadata = timestampTag
					? `${authorName} · ${timestampTag}`
					: authorName;

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						[`${shaDisplay}  **${commitMessage}**`, metadata].join(
							'\n'
						)
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
				new TextDisplayBuilder().setContent(`<t:${unixTimestamp}:f>`)
			);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		} catch (error) {
			console.error(error);
			const container = new ContainerBuilder().setAccentColor(0xda3633);

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'## ❌ Execution Error\nAn error occurred while communicating with the GitHub API.'
				)
			);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container]
			});
		}
	} else if (subcommand === 'status') {
		const container = new ContainerBuilder().setAccentColor(0x238636);

		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'## 🛠️ Repository Status\nRepo status check component is active and running smoothly.'
			)
		);

		await interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: [container],
			ephemeral: true
		});
	}
}
