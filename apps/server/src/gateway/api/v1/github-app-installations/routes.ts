import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CreateSchema,
	InstallationIDParamSchema,
	ReadSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['GitHub App Installations'],
	summary: 'List GitHub app installations',
	description: 'Returns all GitHub app installations.',
	responses: {
		200: response('GitHub app installations', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['GitHub App Installations'],
	summary: 'Get GitHub app installation',
	description: 'Returns a GitHub app installation by ID.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('GitHub app installation', ReadSchema),
		404: response('GitHub app installation not found')
	}
});

export const getByInstallationIDRoute = createHonoRoute({
	method: 'get',
	path: '/installation/{installationId}',
	tags: ['GitHub App Installations'],
	summary: 'Get GitHub app installation by installation ID',
	description:
		'Returns a GitHub app installation by its numeric installation ID.',
	request: {
		params: InstallationIDParamSchema
	},
	responses: {
		200: response('GitHub app installation', ReadSchema),
		404: response('GitHub app installation not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['GitHub App Installations'],
	summary: 'Create GitHub app installation',
	description: 'Creates a new GitHub app installation.',
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
		201: response('GitHub app installation created', ReadSchema),
		400: response('Invalid request')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['GitHub App Installations'],
	summary: 'Update GitHub app installation',
	description: 'Updates an existing GitHub app installation.',
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
		200: response('GitHub app installation updated', ReadSchema),
		400: response('Invalid request'),
		404: response('GitHub app installation not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['GitHub App Installations'],
	summary: 'Delete GitHub app installation',
	description: 'Deletes an existing GitHub app installation.',
	request: {
		params: IDParamSchema
	},
	responses: {
		200: response('GitHub app installation deleted', ResponseSchema),
		404: response('GitHub app installation not found')
	}
});
