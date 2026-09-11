import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CreateUserSessionSchema,
	UpdateUserSessionSchema,
	UserSessionActionResponseSchema,
	UserSessionParamSchema,
	UserSessionSchema,
	UserSessionUserIdParamSchema
} from './schemas';

export const listUserSessionsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['User Sessions'],
	summary: 'List user sessions',
	description: 'Returns all user sessions.',
	responses: {
		200: response('User sessions', z.array(UserSessionSchema))
	}
});

export const getUserSessionByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Get user session by ID',
	description: 'Returns a user session by ID.',
	request: {
		params: UserSessionParamSchema
	},
	responses: {
		200: response('User session', UserSessionSchema),
		404: response('User session not found')
	}
});

export const getUserSessionByUserIdRoute = createRoute({
	method: 'get',
	path: '/user/{userId}',
	tags: ['User Sessions'],
	summary: 'Get user session by User ID',
	description: 'Returns the user session associated with a specific user ID.',
	request: {
		params: UserSessionUserIdParamSchema
	},
	responses: {
		200: response('User session', UserSessionSchema),
		404: response('User session not found')
	}
});

export const createUserSessionRoute = createRoute({
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
					schema: CreateUserSessionSchema
				}
			}
		}
	},
	responses: {
		201: response('User session created', UserSessionSchema),
		400: response('Invalid request'),
		404: response('User not found'),
		409: response('Session already exists for user')
	}
});

export const updateUserSessionRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Update user session',
	description: 'Updates an existing user session.',
	request: {
		params: UserSessionParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateUserSessionSchema
				}
			}
		}
	},
	responses: {
		200: response('User session updated', UserSessionSchema),
		400: response('Invalid request'),
		404: response('User session not found')
	}
});

export const deleteUserSessionRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['User Sessions'],
	summary: 'Delete user session',
	description: 'Deletes an existing user session.',
	request: {
		params: UserSessionParamSchema
	},
	responses: {
		200: response('User session deleted', UserSessionActionResponseSchema),
		404: response('User session not found')
	}
});
