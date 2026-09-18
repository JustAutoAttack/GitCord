import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import { ReadSchema, UserIdParamSchema } from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['User Sessions'],
	summary: 'List user sessions',
	description: 'Returns all user sessions.',
	middleware: [requireAuth] as const,
	responses: {
		200: response('User sessions', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Get user session by ID',
	description: 'Returns a user session by ID.',
	middleware: [requireAuth] as const,
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('User session', ReadSchema),
		404: response('User session not found')
	}
});

export const getByUserIdRoute = createHonoRoute({
	method: 'get',
	path: '/user/{userId}',
	tags: ['User Sessions'],
	summary: 'Get user session by User ID',
	description: 'Returns the user session associated with a specific user ID.',
	middleware: [requireAuth] as const,
	request: {
		params: UserIdParamSchema
	},
	responses: {
		200: response('User session', ReadSchema),
		404: response('User session not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Delete user session',
	description: 'Deletes an existing user session.',
	middleware: [requireAuth] as const,
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('User session deleted', ResponseSchema),
		404: response('User session not found')
	}
});
