import { asyncLocalStorageService, jwtService, ENV } from '@core';

export class IntegrationsService {
	getGitHubInstallUrl(): string {
		const userId = asyncLocalStorageService.getUserId();
		const stateToken = jwtService.sign({
			sub: userId,
			type: 'github_install_state'
		});

		const appSlug = ENV.GITHUB_APP_SLUG;
		return `https://github.com/apps/${appSlug}/installations/new?state=${stateToken}`;
	}

	getDiscordBotInstallUrl(): string {
		const userId = asyncLocalStorageService.getUserId();
		const stateToken = jwtService.sign({
			sub: userId,
			type: 'discord_bot_state'
		});

		const clientId = ENV.DISCORD_CLIENT_ID;
		const redirectUri = encodeURIComponent(
			`${ENV.BASE_URL}/api/v1/integrations/discord/callback`
		);
		const scopes = encodeURIComponent('bot applications.commands');
		const permissions = '8';

		return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code&state=${stateToken}`;
	}
}

export const integrationsService = new IntegrationsService();
