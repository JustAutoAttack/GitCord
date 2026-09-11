import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CreateGuildUserPermissionSchema,
	GetByGuildAndUserQuerySchema,
	GuildUserPermissionActionResponseSchema,
	GuildUserPermissionParamSchema,
	GuildUserPermissionSchema,
	ListGuildUserPermissionsQuerySchema,
	UpdateGuildUserPermissionSchema
} from './schemas';

export const listGuildUserPermissionsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Guild User Permissions'],
	summary: 'List guild user permissions',
	description:
		'Returns all guild user permissions, optionally filtered by guildId.',
	request: {
		query: ListGuildUserPermissionsQuerySchema
	},
	responses: {
		200: response(
			'Guild user permissions',
			z.array(GuildUserPermissionSchema)
		)
	}
});

export const getGuildUserPermissionByGuildAndUserRoute = createRoute({
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
		200: response(
			'Guild user permissions',
			z.array(GuildUserPermissionSchema)
		),
		400: response('Invalid request')
	}
});

export const getGuildUserPermissionByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Get guild user permission by ID',
	description: 'Returns a guild user permission by ID.',
	request: {
		params: GuildUserPermissionParamSchema
	},
	responses: {
		200: response('Guild user permission', GuildUserPermissionSchema),
		404: response('Permission not found')
	}
});

export const createGuildUserPermissionRoute = createRoute({
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
					schema: CreateGuildUserPermissionSchema
				}
			}
		}
	},
	responses: {
		201: response(
			'Guild user permission created',
			GuildUserPermissionSchema
		),
		400: response('Invalid request'),
		404: response('Bot command not found'),
		409: response('Permission already exists')
	}
});

export const updateGuildUserPermissionRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Update guild user permission',
	description: 'Updates an existing guild user permission.',
	request: {
		params: GuildUserPermissionParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateGuildUserPermissionSchema
				}
			}
		}
	},
	responses: {
		200: response(
			'Guild user permission updated',
			GuildUserPermissionSchema
		),
		400: response('Invalid request'),
		404: response('Permission or command not found')
	}
});

export const deleteGuildUserPermissionRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Guild User Permissions'],
	summary: 'Delete guild user permission',
	description: 'Deletes an existing guild user permission.',
	request: {
		params: GuildUserPermissionParamSchema
	},
	responses: {
		200: response(
			'Guild user permission deleted',
			GuildUserPermissionActionResponseSchema
		),
		404: response('Permission not found')
	}
});
