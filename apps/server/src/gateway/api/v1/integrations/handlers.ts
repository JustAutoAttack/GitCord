import type { RouteHandler } from '@hono/zod-openapi';

import { jwtService } from '@core';
import { integrationsService } from '@services';
import {
	githubAppInstallRoute,
	discordBotInstallRoute,
	discordBotInstallCallbackRoute
} from './routes';
import { logger } from '../../logger';

export const githubAppInstallHandler: RouteHandler<typeof githubAppInstallRoute> = async (
	ctx
) => {
	logger.debug('API Request: Initiate GitHub App install redirect');
	const url = integrationsService.getGitHubInstallUrl();
	return ctx.redirect(url, 302);
};

export const discordBotInstallHandler: RouteHandler<
	typeof discordBotInstallRoute
> = async (ctx) => {
	logger.debug('API Request: Initiate Discord Bot install redirect');
	const url = integrationsService.getDiscordBotInstallUrl();
	return ctx.redirect(url, 302);
};

export const discordBotInstallCallbackHandler: RouteHandler<
	typeof discordBotInstallCallbackRoute
> = async (ctx) => {
	logger.debug('API Request: Discord Bot callback');
	const { guild_id, permissions, state } = ctx.req.valid('query');

	if (state) {
		const payload = jwtService.verify(state);
		if (payload) {
			const userId = payload.sub;
			// TODO: Map guild_id to userId or server settings table
		}
	}

	return ctx.json(
		{
			success: true,
			message: 'Discord Bot added successfully',
			data: { guildId: guild_id, permissions }
		},
		200
	);
};
