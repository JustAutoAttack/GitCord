import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CreateUserSchema,
	DiscordParamSchema,
	UserActionResponseSchema,
	UserParamSchema,
	UserSchema,
	UpdateUserSchema
} from './schemas';

export const listUsersRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Users'],
	summary: 'List users',
	description: 'Returns all users.',
	responses: {
		200: response('Users', z.array(UserSchema))
	}
});

export const getUserByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Get user by ID',
	description: 'Returns a user by ID.',
	request: {
		params: UserParamSchema
	},
	responses: {
		200: response('User', UserSchema),
		404: response('User not found')
	}
});

export const getUserByDiscordIdRoute = createRoute({
	method: 'get',
	path: '/discord/{discordId}',
	tags: ['Users'],
	summary: 'Get user by Discord ID',
	description: 'Returns a user by their Discord ID.',
	request: {
		params: DiscordParamSchema
	},
	responses: {
		200: response('User', UserSchema),
		404: response('User not found')
	}
});

export const createUserRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Users'],
	summary: 'Create user',
	description: 'Creates a new user.',
	request: {
		body: {
			required: true,
			content: {
				'application/json': {
					schema: CreateUserSchema
				}
			}
		}
	},
	responses: {
		201: response('User created', UserSchema),
		400: response('Invalid request'),
		409: response('User already exists')
	}
});

export const updateUserRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Update user',
	description: 'Updates an existing user.',
	request: {
		params: UserParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateUserSchema
				}
			}
		}
	},
	responses: {
		200: response('User updated', UserSchema),
		400: response('Invalid request'),
		404: response('User not found')
	}
});

export const deleteUserRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Delete user',
	description: 'Deletes an existing user.',
	request: {
		params: UserParamSchema
	},
	responses: {
		200: response('User deleted', UserActionResponseSchema),
		404: response('User not found')
	}
});
