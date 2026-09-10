import type { ChatInputCommandInteraction } from 'discord.js';

import { discordLogger } from '@core';
import * as commands from '../commands';

export async function handleInteraction(
	interaction: ChatInputCommandInteraction
): Promise<void> {
	const commandList = Object.values(commands);
	const matchedCommand = commandList.find(
		(command: any) => command.data.name === interaction.commandName
	);

	if (!matchedCommand) {
		discordLogger.error(
			`No command matching ${interaction.commandName} was found.`
		);

		return;
	}

	try {
		await matchedCommand.execute(interaction);
	} catch (error) {
		discordLogger.error(
			`Error executing ${interaction.commandName}:`,
			error
		);

		const errorMessage = {
			content: 'There was an error while executing this command!',
			ephemeral: true
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(errorMessage);
		} else {
			await interaction.reply(errorMessage);
		}
	}
}
