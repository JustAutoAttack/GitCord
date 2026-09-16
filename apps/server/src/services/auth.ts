import {
	AppError,
	ErrorCode,
	ENV,
	appLogger,
	asyncLocalStorageService
} from '@core';
import type { User } from '@domain';
import { usersService } from './users';
import { userSessionsService } from './user-sessions';

interface DiscordTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

interface DiscordUserProfile {
	id: string;
	username: string;
	avatar: string | null;
}

export class AuthService {
	getDiscordAuthUrl(): string {
		const requestId = asyncLocalStorageService.getServerRequestId();
		appLogger.debug(`[Req: ${requestId}] Generating Discord OAuth URL`);
		return `https://discord.com/api/oauth2/authorize?client_id=${ENV.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(ENV.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
	}

	async handleDiscordCallback(code: string): Promise<User.Model> {
		const requestId = asyncLocalStorageService.getServerRequestId();
		appLogger.debug(
			`[Req: ${requestId}] Processing Discord OAuth code exchange`
		);

		const tokenResponse = await fetch(
			'https://discord.com/api/oauth2/token',
			{
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
			}
		);

		if (!tokenResponse.ok) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Failed to authenticate with Discord'
			);
		}

		const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: { Authorization: `Bearer ${tokenData.access_token}` }
		});

		if (!userResponse.ok) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Failed to fetch Discord user profile'
			);
		}

		const discordUser = (await userResponse.json()) as DiscordUserProfile;

		const avatarUrl = discordUser.avatar
			? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
			: null;

		let user: User.Model | null = await usersService.getByDiscordId(
			discordUser.id
		);
		if (!user) {
			user = await usersService.create({
				discordId: discordUser.id,
				displayName: discordUser.username,
				avatarUrl
			});
		}

		const expiresAt: string = new Date(
			Date.now() + tokenData.expires_in * 1000
		).toISOString();

		const existingSession = await userSessionsService.getByUserId(user.id);
		if (!existingSession) {
			await userSessionsService.create({
				userId: user.id,
				accessTokenEncrypted: tokenData.access_token,
				refreshTokenEncrypted: tokenData.refresh_token,
				expiresAt
			});
		}

		return user;
	}

	async signOut(): Promise<void> {
		const userId = asyncLocalStorageService.getUserId();
		appLogger.debug(`Signing out user ID: ${userId ?? 'unknown'}`);

		if (!userId) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Authentication required'
			);
		}

		const session = await userSessionsService.getByUserId(userId);
		if (!session) {
			throw new AppError(ErrorCode.NOT_FOUND, 'Active session not found');
		}

		await userSessionsService.delete(session.id);
	}
}

export const authService = new AuthService();
