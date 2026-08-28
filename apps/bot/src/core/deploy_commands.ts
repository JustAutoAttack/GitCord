import { REST, Routes } from 'discord.js';

import { commands } from '../commands';
import { ENV } from '../config';

const commandData = commands.map((cmd) => cmd.data.toJSON());

const rest = new REST({ version: '10' }).setToken(ENV.DISCORD_BOT_TOKEN);

(async () => {
	try {
		console.log(
			`[Discord] Started refreshing ${commandData.length} guild application (/) commands.`
		);

		await rest.put(
			Routes.applicationGuildCommands(
				ENV.DISCORD_CLIENT_ID,
				ENV.DISCORD_GUILD_ID
			),
			{ body: commandData }
		);

		console.log(
			`[Discord] Successfully reloaded guild application (/) commands instantly.`
		);
	} catch (error) {
		console.error('[Discord] Failed to deploy commands:', error);
	}
})();
