import { createRoute as createHonoRoute, z } from '@hono/zod-openapi';

import { response } from '../../../utils';
import { IDParamSchema, ResponseSchema } from '../base-schemas';
import {
	CommandNameParamSchema,
	ReadSchema,
	CreateSchema,
	UpdateSchema
} from './schemas';

export const listRoute = createHonoRoute({
	method: 'get',
	path: '/',
	tags: ['Bot Commands'],
	summary: 'List bot commands',
	description: 'Returns all registered bot commands.',
	responses: {
		200: response('Bot commands', z.array(ReadSchema))
	}
});

export const getByIDRoute = createHonoRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Get bot command by ID',
	request: { params: IDParamSchema },
	responses: {
		200: response('Bot command', ReadSchema),
		404: response('Bot command not found')
	}
});

export const getByNameRoute = createHonoRoute({
	method: 'get',
	path: '/name/{commandName}',
	tags: ['Bot Commands'],
	summary: 'Get bot command by Name',
	request: { params: CommandNameParamSchema },
	responses: {
		200: response('Bot command', ReadSchema),
		404: response('Bot command not found')
	}
});

export const createRoute = createHonoRoute({
	method: 'post',
	path: '/',
	tags: ['Bot Commands'],
	summary: 'Create bot command',
	request: {
		body: {
			required: true,
			content: { 'application/json': { schema: CreateSchema } }
		}
	},
	responses: {
		201: response('Bot command created', ReadSchema),
		400: response('Invalid request')
	}
});

export const updateRoute = createHonoRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Update bot command',
	request: {
		params: IDParamSchema,
		body: {
			required: true,
			content: { 'application/json': { schema: UpdateSchema } }
		}
	},
	responses: {
		200: response('Bot command updated', ReadSchema),
		404: response('Bot command not found')
	}
});

export const deleteRoute = createHonoRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Delete bot command',
	request: { params: IDParamSchema },
	responses: {
		200: response('Bot command deleted', ResponseSchema),
		404: response('Bot command not found')
	}
});
