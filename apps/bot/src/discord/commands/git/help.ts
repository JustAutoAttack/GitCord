import {
	ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize
} from 'discord.js';

import { CONFIG } from '@core';
import { logger } from '../../logger';
import { COMMAND_DOCS } from '../constants';

export const helpSubcommand = new SlashCommandSubcommandBuilder()
	.setName('help')
	.setDescription(
		'Display documentation and usage guide for GitCord commands'
	)
	.addStringOption((option) =>
		option
			.setName('command')
			.setDescription(
				'Specific command or subcommand to inspect (e.g., remote add, config server)'
			)
			.setRequired(false)
	);

export async function executeHelp(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const query = interaction.options
		.getString('command')
		?.toLowerCase()
		.trim();
	logger.debug(`Executing /git help with query: "${query || 'all'}"`);

	if (query) {
		const match = (COMMAND_DOCS as Record<string, any>)[query];
		if (!match) {
			const container = new ContainerBuilder().addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`Could not find documentation for \`/git ${query}\`. Use \`/git help\` to view all commands.`
				)
			);
			await interaction.reply({
				components: [container],
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
			});
			return;
		}

		const container = new ContainerBuilder()
			.setAccentColor(CONFIG.github.colors.push ?? 0x2b2d31)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`### ${match.title}`)
			)
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					[
						`• **Description:** ${match.description}`,
						`• **Syntax:** \`${match.syntax}\``,
						`• **Details:** ${match.details}`
					].join('\n')
				)
			);

		await interaction.reply({
			components: [container],
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
		});
		return;
	}

	let summary = '';
	for (const [key, doc] of Object.entries(COMMAND_DOCS)) {
		summary += `• **\`/git ${key}\`** — ${doc.description}\n`;
	}
	summary +=
		'\n-# Use \`/git help <command>\` (e.g., \`/git help remote add\`) for detailed syntax and usage.';

	const container = new ContainerBuilder()
		.setAccentColor(CONFIG.github.colors.push ?? 0x2b2d31)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent('### GitCord Command Reference')
		)
		.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(summary.trim())
		);

	await interaction.reply({
		components: [container],
		flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
	});
}
