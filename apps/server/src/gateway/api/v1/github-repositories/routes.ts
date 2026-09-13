import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	GetByUrlQuerySchema,
	ListQuerySchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['GitHub Repositories'],
	summary: 'List GitHub repositories',
	description:
		'Returns all GitHub repositories, optionally filtered by GitHub App Installation ID.',
	request: {
		query: ListQuerySchema
	},
	responses: {
		200: response('GitHub repositories', z.array(ReadSchema))
	}
});

export const getByUrlRoute = createHonoRoute({
	method: 'get',
	path: '/lookup',
	tags: ['GitHub Repositories'],
	summary: 'Get GitHub repository by URL',
	description:
		'Returns the GitHub repository matching a specific repository URL.',
	request: {
		query: GetByUrlQuerySchema
	},
	responses: {
		200: response('GitHub repository', ReadSchema),
		404: response('GitHub repository not found')
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['GitHub Repositories'],
	summary: 'Get GitHub repository',
	description: 'Returns a GitHub repository by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('GitHub repository', ReadSchema),
		404: response('GitHub repository not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['GitHub Repositories'],
	summary: 'Create GitHub repository',
	description: 'Creates a new GitHub repository entry.',
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
		201: response('GitHub repository created', ReadSchema),
		400: response('Invalid request')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['GitHub Repositories'],
	summary: 'Update GitHub repository',
	description: 'Updates an existing GitHub repository entry.',
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
		200: response('GitHub repository updated', ReadSchema),
		400: response('Invalid request'),
		404: response('GitHub repository not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['GitHub Repositories'],
	summary: 'Delete GitHub repository',
	description: 'Deletes an existing GitHub repository entry.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('GitHub repository deleted', ResponseSchema),
		404: response('GitHub repository not found')
	}
});
