import type { RouteHandler } from '@hono/zod-openapi';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import { ENV } from '@core';
import { authService } from '@services';

import { signUpRoute, discordCallbackRoute, signOutRoute } from './routes';

import { logger } from '../../logger';

const OAUTH_BINDING_COOKIE = 'gitcord_oauth_binding';
const OAUTH_BINDING_COOKIE_PATH = '/api/v1/auth';
const OAUTH_BINDING_TTL_SECONDS = 10 * 60;

export const signUpHandler: RouteHandler<typeof signUpRoute> = async (ctx) => {
	logger.debug('API Request: Sign up');

	const { client } = ctx.req.valid('query');

	const result = authService.startDiscordAuthentication(client);

	if (client === 'browser' && result.browserBinding) {
		setCookie(ctx, OAUTH_BINDING_COOKIE, result.browserBinding, {
			httpOnly: true,
			secure: ENV.NODE_ENV === 'production',
			sameSite: 'Lax',
			path: OAUTH_BINDING_COOKIE_PATH,
			maxAge: OAUTH_BINDING_TTL_SECONDS
		});
	}

	return ctx.redirect(result.authorizationUrl, 302);
};

export const signOutHandler: RouteHandler<typeof signOutRoute> = async (
	ctx
) => {
	logger.debug('API Request: Sign out');

	await authService.signOut();

	return ctx.json(
		{
			success: true,
			message: 'Successfully signed out'
		},
		200
	);
};

export const discordCallbackHandler: RouteHandler<
	typeof discordCallbackRoute
> = async (ctx) => {
	logger.debug('API Request: Discord OAuth callback');

	const { code, state } = ctx.req.valid('query');

	const callbackUrl = `${ENV.DASHBOARD_URL}/auth/callback`;

	/*
	 * The binding cookie is only used for browser authentication.
	 *
	 * For Tauri, no browser cookie is present and the OAuth state
	 * record contains no browser binding.
	 */
	const browserBinding = getCookie(ctx, OAUTH_BINDING_COOKIE) ?? null;

	try {
		const result = await authService.handleDiscordCallback(
			code,
			state,
			browserBinding
		);

		/*
		 * The OAuth binding is no longer needed once the state has
		 * been successfully consumed.
		 */
		deleteCookie(ctx, OAUTH_BINDING_COOKIE, {
			path: OAUTH_BINDING_COOKIE_PATH
		});

		const params = new URLSearchParams({
			success: 'true',
			client: result.client
		});

		return ctx.redirect(`${callbackUrl}?${params.toString()}`, 302);
	} catch (error) {
		logger.error('Discord OAuth callback failed:', error);

		/*
		 * Do not reflect state, client, error details, or tokens
		 * back to the frontend.
		 */
		const params = new URLSearchParams({
			success: 'false'
		});

		return ctx.redirect(`${callbackUrl}?${params.toString()}`, 302);
	}
};
