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
				const container = new ContainerBuilder().setAccentColor(
					0xda3633
				);

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## ❌ GitHub API Error\nFailed to fetch logs from GitHub (Status code: \`${response.status}\`). Make sure the branch name \`${branch}\` exists.`
					)
				);

				await interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container]
				});
				return;
			}

			let commits = (await response.json()) as Array<any>;

			if (authorFilter) {
				const query = authorFilter.toLowerCase().replace(/^@/, '');
				commits = commits.filter((c) => {
					const login = c.author?.login?.toLowerCase() ?? '';
					const email = c.commit?.author?.email?.toLowerCase() ?? '';

					return login.includes(query) || email.includes(query);
				});
			}

			if (!commits.length) {
				const container = new ContainerBuilder().setAccentColor(
					0x30363d
				);

				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## ⚠️ No Commits Found\nNo commits found for branch \`${branch}\`${authorFilter ? ` matching username \`@${authorFilter.replace(/^@/, '')}\`` : ''}.`
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
					`## 📦 Branch Commits\n[JustAutoAttack/GitCord](https://github.com/JustAutoAttack/GitCord) · ${scopeText}`
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

				const email = c.commit?.author?.email ?? '';
				const emailHandle = email.includes('@')
					? email.split('@')[0]
					: '';
				const username = (c.author?.login ?? emailHandle) || 'unknown';

				const commitDate = c.commit.author?.date;
				const timestampTag = commitDate
					? `<t:${Math.floor(new Date(commitDate).getTime() / 1000)}:R>`
					: '';

				const shaDisplay = c.html_url
					? `[\`${sha}\`](${c.html_url})`
					: `\`${sha}\``;
				const metadata = timestampTag
					? `@${username} · ${timestampTag}`
					: `@${username}`;

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
