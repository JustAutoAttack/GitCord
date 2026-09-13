import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	ReadSchema,
	UpdateSchema,
	UserIdParamSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['User Sessions'],
	summary: 'List user sessions',
	description: 'Returns all user sessions.',
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
	request: {
		params: UserIdParamSchema
	},
	responses: {
		200: response('User session', ReadSchema),
		404: response('User session not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['User Sessions'],
	summary: 'Create user session',
	description: 'Creates a new user session.',
	request: {
		body: {
			required: true,
			content: {
				'application/json': {
					schema: CreateSchema
				}
			}
		}
	},
	responses: {
		201: response('User session created', ReadSchema),
		400: response('Invalid request'),
		404: response('User not found'),
		409: response('Session already exists for user')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Update user session',
	description: 'Updates an existing user session.',
	request: {
		params: IDParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateSchema
				}
			}
		}
	},
	responses: {
		200: response('User session updated', ReadSchema),
		400: response('Invalid request'),
		404: response('User session not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Delete user session',
	description: 'Deletes an existing user session.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('User session deleted', ResponseSchema),
		404: response('User session not found')
	}
});
