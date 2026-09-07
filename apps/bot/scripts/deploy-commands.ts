import { REST, Routes } from 'discord.js';

import { ENV } from '@core';
import { commands as github_commands } from '@features/github';

const commandData = github_commands.map((command) => command.data.toJSON());

const rest = new REST({
	version: '10'
}).setToken(ENV.DISCORD_BOT_TOKEN);

(async () => {
	try {
		console.log(
			`[Discord] Registering ${commandData.length} guild application commands...`
		);

		await rest.put(
			Routes.applicationGuildCommands(
				ENV.DISCORD_CLIENT_ID,
				ENV.DISCORD_GUILD_ID
			),
			{
				body: commandData
			}
		);

		console.log(
			'[Discord] Guild application commands registered successfully.'
		);
	} catch (error) {
		console.error(
			'[Discord] Failed to register application commands:',
			error
		);

		process.exitCode = 1;
	}
})();
