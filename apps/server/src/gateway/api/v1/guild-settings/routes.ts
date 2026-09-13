import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	GuildIdParamSchema,
	ReadSchema,
	SystemChannelParamSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Guild Settings'],
	summary: 'List guild settings',
	description: 'Returns all guild settings configurations.',
	responses: {
		200: response('Guild settings', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Get guild setting by ID',
	description: 'Returns a guild setting configuration by its ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild setting', ReadSchema),
		404: response('Guild setting not found')
	}
});

export const getByGuildRoute = createHonoRoute({
	method: 'get',
	path: '/guild/{guildId}',
	tags: ['Guild Settings'],
	summary: 'Get guild setting by guild ID',
	description:
		'Returns the guild setting configuration associated with a specific guild.',
	request: {
		params: GuildIdParamSchema
	},
	responses: {
		200: response('Guild setting', ReadSchema),
		404: response('Guild setting not found for guild')
	}
});

export const getBySystemChannelRoute = createHonoRoute({
	method: 'get',
	path: '/system-channel/{systemChannelId}',
	tags: ['Guild Settings'],
	summary: 'Get guild setting by system channel ID',
	description:
		'Returns the guild setting configuration associated with a system channel.',
	request: {
		params: SystemChannelParamSchema
	},
	responses: {
		200: response('Guild setting', ReadSchema),
		404: response('Guild setting not found for system channel')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['Guild Settings'],
	summary: 'Create guild setting',
	description: 'Creates a new guild setting configuration.',
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
		201: response('Guild setting created', ReadSchema),
		400: response('Invalid request'),
		409: response('Conflict')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Update guild setting',
	description: 'Updates an existing guild setting configuration.',
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
		200: response('Guild setting updated', ReadSchema),
		400: response('Invalid request'),
		404: response('Guild setting not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Delete guild setting',
	description: 'Deletes an existing guild setting configuration.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild setting deleted', ResponseSchema),
		404: response('Guild setting not found')
	}
});
