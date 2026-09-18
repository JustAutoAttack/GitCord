import {
	AppError,
	ErrorCode,
	appLogger,
	asyncLocalStorageService,
	cryptoService,
	jwtService
} from '@core';
import type { OAuthState, User } from '@domain';
import { discordAuthService } from './discord-auth';
import { discordSessionsService } from './discord-sessions';
import { oauthStatesService } from './oauth-states';
import { usersService } from './users';
import { userSessionsService } from './user-sessions';

export class AuthService {
	startDiscordAuthentication(client: OAuthState.Client): {
		authorizationUrl: string;
		browserBinding: string | null;
	} {
		const requestId = asyncLocalStorageService.getServerRequestId();

		appLogger.debug(
			`[Request ID: ${requestId}] Starting Discord authentication for ${client} client`
		);

		const oauthState = oauthStatesService.create(client);

		const authorizationUrl = discordAuthService.getAuthorizationUrl(
			oauthState.state
		);

		return {
			authorizationUrl,
			browserBinding: oauthState.browserBinding
		};
	}

	async handleDiscordCallback(
		code: string,
		state: string,
		browserBinding: string | null
	): Promise<{
		user: User.Model;
		client: OAuthState.Client;
	}> {
		const requestId = asyncLocalStorageService.getServerRequestId();

		appLogger.debug(
			`[Req: ${requestId}] Processing Discord OAuth callback`
		);

		/*
		 * Validate and consume the OAuth state before exchanging
		 * the authorization code.
		 *
		 * This establishes that the callback belongs to an
		 * authentication flow that GitCord actually initiated.
		 */
		const oauthState = oauthStatesService.consume(state, browserBinding);

		const discordTokens = await discordAuthService.exchangeCode(code);

		const discordUser = await discordAuthService.getUser(
			discordTokens.accessToken
		);

		const avatarUrl = discordUser.avatar
			? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
			: null;

		let user = await usersService.getByDiscordId(discordUser.id);

		if (!user) {
			user = await usersService.create({
				discordId: discordUser.id,
				displayName: discordUser.username,
				avatarUrl
			});
		}

		const discordExpiresAt = new Date(
			Date.now() + discordTokens.expiresIn * 1000
		).toISOString();

		/*
		 * Discord credentials are long-lived credentials owned by
		 * Discord. They must remain recoverable so GitCord can use
		 * the refresh token to obtain new Discord access tokens.
		 *
		 * DiscordSessionsService / its mapper encrypts both tokens
		 * before they are persisted.
		 */
		const existingDiscordSession = await discordSessionsService.getByUserId(
			user.id
		);

		if (existingDiscordSession) {
			await discordSessionsService.update(existingDiscordSession.id, {
				accessToken: discordTokens.accessToken,
				refreshToken: discordTokens.refreshToken,
				expiresAt: discordExpiresAt,
				revokedAt: null
			});
		} else {
			await discordSessionsService.create({
				userId: user.id,
				accessToken: discordTokens.accessToken,
				refreshToken: discordTokens.refreshToken,
				expiresAt: discordExpiresAt,
				revokedAt: null
			});
		}

		/*
		 * Generate a new GitCord authentication session.
		 *
		 * The access token is a short-lived JWT.
		 * The refresh token is an opaque random credential and is
		 * stored only as a one-way hash.
		 */
		const accessToken = jwtService.sign({
			sub: user.id
		});

		const refreshToken = cryptoService.generateToken(32);
		const refreshTokenHash = await cryptoService.hashString(refreshToken);

		const gitcordExpiresAt = new Date(
			Date.now() + 15 * 60 * 1000
		).toISOString();

		/*
		 * Current session model: one GitCord session per user.
		 *
		 * This means a new login replaces an existing session.
		 * Consequently, logging in on a second device (for example,
		 * desktop after logging in on a phone) signs the first device
		 * out.
		 *
		 * TODO: Support multiple concurrent GitCord sessions per user,
		 * with independent device/session revocation. At that point,
		 * user_sessions should no longer enforce one session per user.
		 */
		const existingUserSession = await userSessionsService.getByUserId(
			user.id
		);

		if (existingUserSession) {
			await userSessionsService.update(existingUserSession.id, {
				accessToken,
				refreshTokenHash,
				expiresAt: gitcordExpiresAt,
				revokedAt: null
			});
		} else {
			await userSessionsService.create({
				userId: user.id,
				accessToken,
				refreshTokenHash,
				expiresAt: gitcordExpiresAt,
				revokedAt: null
			});
		}

		return {
			user,
			client: oauthState.client
		};
	}

	async signOut(): Promise<void> {
		const userId = asyncLocalStorageService.getUserId();

		appLogger.debug(`Signing out GitCord user ID: ${userId ?? 'unknown'}`);

		if (!userId) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Authentication required'
			);
		}

		/*
		 * GitCord sign-out only terminates the GitCord session.
		 * It does not terminate the user's Discord OAuth
		 * authorization.
		 */
		const session = await userSessionsService.getByUserId(userId);

		if (!session) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				'Active GitCord session not found'
			);
		}

		await userSessionsService.revokeCurrentUserSession();
	}
}

export const authService = new AuthService();
