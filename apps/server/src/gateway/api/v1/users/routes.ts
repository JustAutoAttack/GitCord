import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { requireAuth } from '@core';
import { response } from '../../../utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	DiscordIDParamSchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Users'],
	summary: 'List users',
	description: 'Returns all users.',
	responses: {
		200: response('Users', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Get user by ID',
	description: 'Returns a user by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('User', ReadSchema),
		404: response('User not found')
	}
});

export const getMeRoute = createHonoRoute({
	method: 'get',
	path: '/me',
	tags: ['Users'],
	summary: 'Get current user',
	description: 'Returns the currently authenticated user.',
	middleware: [requireAuth] as const,
	responses: {
		200: response('Current user', ReadSchema),
		401: response('Unauthorized'),
		404: response('User not found')
	}
});

export const getByDiscordIDRoute = createHonoRoute({
	method: 'get',
	path: '/discord/{discordId}',
	tags: ['Users'],
	summary: 'Get user by Discord ID',
	description: 'Returns a user by their Discord ID.',
	request: {
		params: DiscordIDParamSchema
	},
	responses: {
		200: response('User', ReadSchema),
		404: response('User not found')
	}
});

export const createRoute = createHonoRoute({
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
					schema: CreateSchema
				}
			}
		}
	},
	responses: {
		201: response('User created', ReadSchema),
		400: response('Invalid request'),
		409: response('User already exists')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Update user',
	description: 'Updates an existing user.',
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
		200: response('User updated', ReadSchema),
		400: response('Invalid request'),
		404: response('User not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Users'],
	summary: 'Delete user',
	description: 'Deletes an existing user.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('User deleted', ResponseSchema),
		404: response('User not found')
	}
});
