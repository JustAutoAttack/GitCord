import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CommandChannelParamSchema,
	CreateSchema,
	GetByGuildAndGithubRepositoryQuerySchema,
	ListQuerySchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Guild Repositories'],
	summary: 'List guild repositories',
	description:
		'Returns all guild repositories, optionally filtered by guildId or GitHub repository ID.',
	request: {
		query: ListQuerySchema
	},
	responses: {
		200: response('Guild repositories', z.array(ReadSchema))
	}
});

export const getByGuildAndGithubRepositoryRoute = createHonoRoute({
	method: 'get',
	path: '/lookup',
	tags: ['Guild Repositories'],
	summary: 'Get guild repository by guild and GitHub repository',
	description:
		'Returns the guild repository matching a specific guild ID and GitHub repository ID.',
	request: {
		query: GetByGuildAndGithubRepositoryQuerySchema
	},
	responses: {
		200: response('Guild repository', ReadSchema),
		404: response('Guild repository not found')
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Guild Repositories'],
	summary: 'Get guild repository',
	description: 'Returns a guild repository by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild repository', ReadSchema),
		404: response('Guild repository not found')
	}
});

export const getByCommandChannelRoute = createHonoRoute({
	method: 'get',
	path: '/command-channel/{commandChannelId}',
	tags: ['Guild Repositories'],
	summary: 'Get guild repository by command channel',
	description:
		'Returns the guild repository associated with a command channel.',
	request: {
		params: CommandChannelParamSchema
	},
	responses: {
		200: response('Guild repository', ReadSchema),
		404: response('Guild repository not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['Guild Repositories'],
	summary: 'Create guild repository',
	description: 'Creates a new guild repository subscription.',
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
		201: response('Guild repository created', ReadSchema),
		400: response('Invalid request')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Guild Repositories'],
	summary: 'Update guild repository',
	description: 'Updates an existing guild repository subscription.',
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
		200: response('Guild repository updated', ReadSchema),
		400: response('Invalid request'),
		404: response('Guild repository not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Guild Repositories'],
	summary: 'Delete guild repository',
	description: 'Deletes an existing guild repository subscription.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('Guild repository deleted', ResponseSchema),
		404: response('Guild repository not found')
	}
});
