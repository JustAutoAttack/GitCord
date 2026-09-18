import { AppError, ErrorCode, ENV, appLogger } from '@core';

export interface DiscordOAuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface DiscordUserProfile {
	id: string;
	username: string;
	avatar: string | null;
}

export class DiscordAuthService {
	getAuthorizationUrl(state: string): string {
		appLogger.debug('Generating Discord OAuth authorization URL.');

		const params = new URLSearchParams({
			client_id: ENV.DISCORD_CLIENT_ID,
			redirect_uri: ENV.DISCORD_REDIRECT_URI,
			response_type: 'code',
			scope: 'identify',
			state
		});

		return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
	}

	async exchangeCode(code: string): Promise<DiscordOAuthTokens> {
		appLogger.debug('Exchanging Discord OAuth authorization code.');

		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: ENV.DISCORD_CLIENT_ID,
				client_secret: ENV.DISCORD_CLIENT_SECRET,
				grant_type: 'authorization_code',
				code,
				redirect_uri: ENV.DISCORD_REDIRECT_URI
			})
		});

		if (!response.ok) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Failed to authenticate with Discord'
			);
		}

		const data = (await response.json()) as {
			access_token: string;
			refresh_token: string;
			expires_in: number;
		};

		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresIn: data.expires_in
		};
	}

	async getUser(accessToken: string): Promise<DiscordUserProfile> {
		appLogger.debug('Fetching authenticated Discord user.');

		const response = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Failed to fetch Discord user profile'
			);
		}

		return (await response.json()) as DiscordUserProfile;
	}
}

export const discordAuthService = new DiscordAuthService();
