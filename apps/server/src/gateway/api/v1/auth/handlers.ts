import type { RouteHandler } from '@hono/zod-openapi';

import { AppError, ENV, ErrorCode } from '@core';
import { authService, userSessionsService } from '@services';
import { signUpRoute, discordCallbackRoute, signOutRoute } from './routes';
import { logger } from '../../logger';

export const signUpHandler: RouteHandler<typeof signUpRoute> = async (ctx) => {
	logger.debug('API Request: Sign up');

	const { client } = ctx.req.valid('query');
	const discordAuthUrl = authService.getDiscordAuthUrl(client);

	return ctx.redirect(discordAuthUrl, 302);
};

export const signOutHandler: RouteHandler<typeof signOutRoute> = async (
	ctx
) => {
	logger.debug('API Request: Sign out');
	await authService.signOut();
	return ctx.json({ success: true, message: 'Successfully signed out' }, 200);
};

export const discordCallbackHandler: RouteHandler<
	typeof discordCallbackRoute
> = async (ctx) => {
	logger.debug('API Request: Discord OAuth callback');
	const { code, state } = ctx.req.valid('query');

	const callbackUrl = `${ENV.DASHBOARD_URL}/auth/callback`;
	
	try {
		const user = await authService.handleDiscordCallback(code);
		const session = await userSessionsService.getByUserId(user.id);

		if (!session) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`No active session found for user ID: ${user.id}`
			);
		}

		const accessToken = session.accessTokenEncrypted ?? '';
		const refreshToken = session.refreshTokenEncrypted ?? '';
		const params = new URLSearchParams({
			success: 'true',
			client: state,
			accessToken,
			refreshToken
		});

		return ctx.redirect(`${callbackUrl}?${params.toString()}`, 302);
	} catch (error) {
		logger.error('Discord OAuth callback failed:', error);

		const errorMessage =
			error instanceof AppError ? error.message : 'Unknown error';

		logger.error(`Callback error details: ${errorMessage}`);

		const params = new URLSearchParams({
			success: 'false',
			client: state
		});

		return ctx.redirect(`${callbackUrl}?${params.toString()}`, 302);
	}
};
