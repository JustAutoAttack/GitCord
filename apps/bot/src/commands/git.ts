import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder
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

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === 'log') {
		await interaction.deferReply();
		const branch = interaction.options.getString('branch') ?? 'main';
		const author = interaction.options.getString('author');

		try {
			const url = `https://api.github.com/repos/JustAutoAttack/GitCord/commits?sha=${branch}${author ? `&author=${author}` : ''}`;
			const response = await fetch(url, {
				headers: { 'User-Agent': 'GitCord-Bot' }
			});

			if (!response.ok) {
				const errorEmbed = new EmbedBuilder()
					.setColor(0xda3633)
					.setTitle('❌ GitHub API Error')
					.setDescription(
						`Failed to fetch logs from GitHub (Status code: \`${response.status}\`). Make sure the branch name \`${branch}\` exists.`
					);

				await interaction.editReply({ embeds: [errorEmbed] });
				return;
			}

			const commits = (await response.json()) as Array<any>;
			if (!commits.length) {
				const emptyEmbed = new EmbedBuilder()
					.setColor(0x30363d)
					.setTitle('⚠️ No Commits Found')
					.setDescription(
						`No commits found for branch \`${branch}\`${author ? ` by @${author}` : ''}.`
					);

				await interaction.editReply({ embeds: [emptyEmbed] });
			}

			const embed = new EmbedBuilder()
				.setColor(0x2f81f7)
				.setTitle(`📦 Recent Commits · JustAutoAttack/GitCord`)
				.setDescription(
					`Branch: \`${branch}\`${author ? ` • Author: \`@${author}\`` : ''}`
				)
				.setTimestamp();

			const topCommits = commits.slice(0, 5);
			for (const c of topCommits) {
				const sha = c.sha.substring(0, 7);
				const commitMessage = c.commit.message.split('\n')[0];
				const authorName =
					c.author?.login ?? c.commit.author.name ?? 'unknown';

				const commitDate = c.commit.author?.date;
				const timestampTag = commitDate
					? `<t:${Math.floor(new Date(commitDate).getTime() / 1000)}:R>`
					: 'Unknown time';

				embed.addFields({
					name: `Commit — [\`${sha}\`](${c.html_url})`,
					value: `> ${commitMessage.trim()}\n👤 **Contributor:** \`${authorName}\` • 🕒 ${timestampTag}`
				});
			}

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error(error);
			const catchEmbed = new EmbedBuilder()
				.setColor(0xda3633)
				.setTitle('❌ Execution Error')
				.setDescription(
					'An error occurred while communicating with the GitHub API.'
				);

			await interaction.editReply({ embeds: [catchEmbed] });
		}
	} else if (subcommand === 'status') {
		const statusEmbed = new EmbedBuilder()
			.setColor(0x238636)
			.setTitle('🛠️ Repository Status')
			.setDescription(
				'Repo status check component is active and running smoothly.'
			);

		await interaction.reply({
			embeds: [statusEmbed],
			ephemeral: true
		});
	}
}
