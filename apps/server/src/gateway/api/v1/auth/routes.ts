import { createRoute as createHonoRoute } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '../../../utils';
import { ResponseSchema } from '../base-schemas';
import { DiscordCallbackQuerySchema, AuthSuccessSchema } from './schemas';

export const discordAuthRoute = createHonoRoute({
	method: 'get',
	path: '/discord',
	tags: ['Auth'],
	summary: 'Redirect to Discord OAuth',
	description: 'Initiates Discord OAuth2 authentication flow.',
	responses: {
		302: response('Redirects to Discord')
	}
});

export const discordCallbackRoute = createHonoRoute({
	method: 'get',
	path: '/discord/callback',
	tags: ['Auth'],
	summary: 'Discord OAuth Callback',
	description:
		'Handles the OAuth callback from Discord, logs in or registers the user, and creates/updates their session.',
	request: {
		query: DiscordCallbackQuerySchema
	},
	responses: {
		200: response('Successfully authenticated', AuthSuccessSchema),
		401: response('Authentication failed')
	}
});

export const signOutRoute = createHonoRoute({
	method: 'post',
	path: '/sign-out',
	tags: ['Auth'],
	summary: 'Sign out',
	description: 'Clears the current session for the authenticated user.',
	middleware: [requireAuth] as const,
	responses: {
		200: response('Signed out successfully', ResponseSchema),
		401: response('Unauthorized')
	}
});
