import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	GetByGuildAndUserQuerySchema,
	ListQuerySchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Guild User Permissions'],
	summary: 'List guild user permissions',
	description:
		'Returns all guild user permissions, optionally filtered by guildId.',
	request: {
		query: ListQuerySchema
	},
	responses: {
		200: response('Guild user permissions', z.array(ReadSchema))
	}
});

export const getByGuildAndUserRoute = createHonoRoute({
	method: 'get',
	path: '/lookup',
	tags: ['Guild User Permissions'],
	summary: 'Get permissions by guild and user',
	description:
		'Returns all command permissions for a specific user within a guild.',
	request: {
		query: GetByGuildAndUserQuerySchema
	},
	responses: {
		200: response('Guild user permissions', z.array(ReadSchema)),
		400: response('Invalid request')
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Get guild user permission by ID',
	description: 'Returns a guild user permission by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild user permission', ReadSchema),
		404: response('Permission not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['Guild User Permissions'],
	summary: 'Create guild user permission',
	description: 'Grants a command permission to a user in a guild.',
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
		201: response('Guild user permission created', ReadSchema),
		400: response('Invalid request'),
		404: response('Bot command not found'),
		409: response('Permission already exists')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Update guild user permission',
	description: 'Updates an existing guild user permission.',
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
		200: response('Guild user permission updated', ReadSchema),
		400: response('Invalid request'),
		404: response('Permission or command not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Delete guild user permission',
	description: 'Deletes an existing guild user permission.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild user permission deleted', ResponseSchema),
		404: response('Permission not found')
	}
});
