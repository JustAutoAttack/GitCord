import type { RouteHandler } from '@hono/zod-openapi';

import { authService } from '@services';
import { discordAuthRoute, discordCallbackRoute, signOutRoute } from './routes';
import { logger } from '../../logger';

export const discordAuthHandler: RouteHandler<typeof discordAuthRoute> = async (
	ctx
) => {
	logger.debug('API Request: Redirect to Discord OAuth');
	const discordAuthUrl = authService.getDiscordAuthUrl();
	return ctx.redirect(discordAuthUrl, 302);
};

export const discordCallbackHandler: RouteHandler<
	typeof discordCallbackRoute
> = async (ctx) => {
	logger.debug('API Request: Discord OAuth callback');
	const { code } = ctx.req.valid('query');

	const user = await authService.handleDiscordCallback(code);

	return ctx.json({ success: true, data: { user } }, 200);
};

export const signOutHandler: RouteHandler<typeof signOutRoute> = async (
	ctx
) => {
	logger.debug('API Request: Sign out');
	// If you extract user from context auth middleware later, you can pass userId here
	await authService.signOut();
	return ctx.json({ success: true, message: 'Successfully signed out' }, 200);
};
