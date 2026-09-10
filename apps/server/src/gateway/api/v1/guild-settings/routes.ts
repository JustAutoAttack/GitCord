import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CreateGuildSettingSchema,
	GuildIdParamSchema,
	GuildSettingActionResponseSchema,
	GuildSettingParamSchema,
	GuildSettingSchema,
	SystemChannelParamSchema,
	UpdateGuildSettingSchema
} from './schemas';

export const listGuildSettingsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Guild Settings'],
	summary: 'List guild settings',
	description: 'Returns all guild settings configurations.',
	responses: {
		200: response('Guild settings', z.array(GuildSettingSchema))
	}
});

export const getGuildSettingByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Get guild setting by ID',
	description: 'Returns a guild setting configuration by its ID.',
	request: {
		params: GuildSettingParamSchema
	},
	responses: {
		200: response('Guild setting', GuildSettingSchema),
		404: response('Guild setting not found')
	}
});

export const getGuildSettingByGuildRoute = createRoute({
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
		200: response('Guild setting', GuildSettingSchema),
		404: response('Guild setting not found for guild')
	}
});

export const getGuildSettingBySystemChannelRoute = createRoute({
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
		200: response('Guild setting', GuildSettingSchema),
		404: response('Guild setting not found for system channel')
	}
});

export const createGuildSettingRoute = createRoute({
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
					schema: CreateGuildSettingSchema
				}
			}
		}
	},
	responses: {
		201: response('Guild setting created', GuildSettingSchema),
		400: response('Invalid request'),
		409: response('Conflict')
	}
});

export const updateGuildSettingRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Update guild setting',
	description: 'Updates an existing guild setting configuration.',
	request: {
		params: GuildSettingParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateGuildSettingSchema
				}
			}
		}
	},
	responses: {
		200: response('Guild setting updated', GuildSettingSchema),
		400: response('Invalid request'),
		404: response('Guild setting not found')
	}
});

export const deleteGuildSettingRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Guild Settings'],
	summary: 'Delete guild setting',
	description: 'Deletes an existing guild setting configuration.',
	request: {
		params: GuildSettingParamSchema
	},
	responses: {
		200: response(
			'Guild setting deleted',
			GuildSettingActionResponseSchema
		),
		404: response('Guild setting not found')
	}
});
