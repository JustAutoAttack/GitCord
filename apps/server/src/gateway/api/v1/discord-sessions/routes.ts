import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '../../../utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import { ReadSchema, DiscordUserIdParamSchema } from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Discord Sessions'],
	summary: 'List discord sessions',
	description: 'Returns all discord sessions.',
	middleware: [requireAuth] as const,
	responses: {
		200: response('Discord sessions', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Discord Sessions'],
	summary: 'Get discord session by ID',
	description: 'Returns a discord session by ID.',
	middleware: [requireAuth] as const,
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Discord session', ReadSchema),
		404: response('Discord session not found')
	}
});

export const getByUserIdRoute = createHonoRoute({
	method: 'get',
	path: '/user/{userId}',
	tags: ['Discord Sessions'],
	summary: 'Get discord session by User ID',
	description:
		'Returns the discord session associated with a specific user ID.',
	middleware: [requireAuth] as const,
	request: {
		params: DiscordUserIdParamSchema
	},
	responses: {
		200: response('Discord session', ReadSchema),
		404: response('Discord session not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Discord Sessions'],
	summary: 'Delete discord session',
	description: 'Deletes an existing discord session.',
	middleware: [requireAuth] as const,
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Discord session deleted', ResponseSchema),
		404: response('Discord session not found')
	}
});
