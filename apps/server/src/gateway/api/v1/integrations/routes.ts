import { createRoute as createHonoRoute } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '../../../utils';
import {
	DiscordBotInstallCallbackQuerySchema,
	IntegrationSuccessSchema
} from './schemas';


export const discordBotInstallRoute = createHonoRoute({
	method: 'get',
	path: '/discord/install',
	tags: ['Integrations'],
	summary: 'Initiate Discord Bot Installation',
	description:
		'Generates state token and redirects the user to the Discord Bot authorization page.',
	middleware: [requireAuth] as const,
	responses: {
		302: response('Redirects to Discord Bot authorization'),
		401: response('Unauthorized')
	}
});

export const discordBotInstallCallbackRoute = createHonoRoute({
	method: 'get',
	path: '/discord/install-callback',
	tags: ['Integrations'],
	summary: 'Discord Bot Installation Callback',
	description:
		'Handles the callback when a user adds the Discord bot to their server.',
	request: {
		query: DiscordBotInstallCallbackQuerySchema
	},
	responses: {
		200: response(
			'Discord Bot added successfully',
			IntegrationSuccessSchema
		),
		400: response('Invalid request parameters')
	}
});
