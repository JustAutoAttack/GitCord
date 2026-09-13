import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CommandChannelParamSchema,
	CreateSchema,
	GetByGuildAndRemoteQuerySchema,
	ListQuerySchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Remote Configurations'],
	summary: 'List remote configurations',
	description:
		'Returns all remote configurations, optionally filtered by guildId.',
	request: {
		query: ListQuerySchema
	},
	responses: {
		200: response('Remote configurations', z.array(ReadSchema))
	}
});

export const getByGuildAndRemoteRoute = createHonoRoute({
	method: 'get',
	path: '/lookup',
	tags: ['Remote Configurations'],
	summary: 'Get remote configuration by guild and repo URL',
	description:
		'Returns the remote configuration matching a specific guild ID and remote URL.',
	request: {
		query: GetByGuildAndRemoteQuerySchema
	},
	responses: {
		200: response('Remote configuration', ReadSchema),
		404: response('Remote configuration not found')
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Get remote configuration',
	description: 'Returns a remote configuration by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Remote configuration', ReadSchema),
		404: response('Remote configuration not found')
	}
});

export const getByCommandChannelRoute = createHonoRoute({
	method: 'get',
	path: '/command-channel/{commandChannelId}',
	tags: ['Remote Configurations'],
	summary: 'Get remote configuration by command channel',
	description:
		'Returns the remote configuration associated with a command channel.',
	request: {
		params: CommandChannelParamSchema
	},
	responses: {
		200: response('Remote configuration', ReadSchema),
		404: response('Remote configuration not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['Remote Configurations'],
	summary: 'Create remote configuration',
	description: 'Creates a new remote configuration.',
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
		201: response('Remote configuration created', ReadSchema),
		400: response('Invalid request')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Update remote configuration',
	description: 'Updates an existing remote configuration.',
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
		200: response('Remote configuration updated', ReadSchema),
		400: response('Invalid request'),
		404: response('Remote configuration not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Delete remote configuration',
	description: 'Deletes an existing remote configuration.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Remote configuration deleted', ResponseSchema),
		404: response('Remote configuration not found')
	}
});
