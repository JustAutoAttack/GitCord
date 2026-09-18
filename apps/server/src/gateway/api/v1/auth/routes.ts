import { createRoute as createHonoRoute } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '../../../utils';
import { ResponseSchema } from '../base-schemas';
import { DiscordCallbackQuerySchema, SignUpQuerySchema } from './schemas';

export const signUpRoute = createHonoRoute({
	method: 'get',
	path: '/sign-up',
	tags: ['Auth'],
	summary: 'Redirect to Discord OAuth',
	description: 'Initiates a Discord OAuth2 authentication flow.',
	request: {
		query: SignUpQuerySchema
	},
	responses: {
		302: response('Redirects to Discord')
	}
});

export const signOutRoute = createHonoRoute({
	method: 'post',
	path: '/sign-out',
	tags: ['Auth'],
	summary: 'Sign out',
	description: 'Revokes the current GitCord authentication session.',
	middleware: [requireAuth] as const,
	responses: {
		200: response('Signed out successfully', ResponseSchema),
		401: response('Unauthorized')
	}
});

export const discordCallbackRoute = createHonoRoute({
	method: 'get',
	path: '/discord/callback',
	tags: ['Auth'],
	summary: 'Discord OAuth Callback',
	description:
		'Validates the OAuth authentication state, completes Discord authentication, establishes the GitCord session, and redirects to the frontend.',
	request: {
		query: DiscordCallbackQuerySchema
	},
	responses: {
		302: response('Redirects to frontend application'),
		401: response('Authentication failed')
	}
});
