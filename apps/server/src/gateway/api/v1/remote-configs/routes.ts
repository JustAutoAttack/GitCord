import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CommandChannelParamSchema,
	CreateRemoteConfigSchema,
	GetByGuildAndRemoteQuerySchema,
	ListRemoteConfigsQuerySchema,
	RemoteConfigActionResponseSchema,
	RemoteConfigParamSchema,
	RemoteConfigSchema,
	UpdateRemoteConfigSchema
} from './schemas';

export const listRemoteConfigsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Remote Configurations'],
	summary: 'List remote configurations',
	description:
		'Returns all remote configurations, optionally filtered by guildId.',
	request: {
		query: ListRemoteConfigsQuerySchema
	},
	responses: {
		200: response('Remote configurations', z.array(RemoteConfigSchema))
	}
});

export const getRemoteConfigByGuildAndRemoteRoute = createRoute({
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
		200: response('Remote configuration', RemoteConfigSchema),
		404: response('Remote configuration not found')
	}
});

export const getRemoteConfigByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Get remote configuration',
	description: 'Returns a remote configuration by ID.',
	request: {
		params: RemoteConfigParamSchema
	},
	responses: {
		200: response('Remote configuration', RemoteConfigSchema),
		404: response('Remote configuration not found')
	}
});

export const getRemoteConfigByCommandChannelRoute = createRoute({
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
		200: response('Remote configuration', RemoteConfigSchema),
		404: response('Remote configuration not found')
	}
});

export const createRemoteConfigRoute = createRoute({
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
					schema: CreateRemoteConfigSchema
				}
			}
		}
	},
	responses: {
		201: response('Remote configuration created', RemoteConfigSchema),
		400: response('Invalid request')
	}
});

export const updateRemoteConfigRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Update remote configuration',
	description: 'Updates an existing remote configuration.',
	request: {
		params: RemoteConfigParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateRemoteConfigSchema
				}
			}
		}
	},
	responses: {
		200: response('Remote configuration updated', RemoteConfigSchema),
		400: response('Invalid request'),
		404: response('Remote configuration not found')
	}
});

export const deleteRemoteConfigRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Remote Configurations'],
	summary: 'Delete remote configuration',
	description: 'Deletes an existing remote configuration.',
	request: {
		params: RemoteConfigParamSchema
	},
	responses: {
		200: response(
			'Remote configuration deleted',
			RemoteConfigActionResponseSchema
		),
		404: response('Remote configuration not found')
	}
});
