import { createRoute, z } from '@hono/zod-openapi';
import { response } from '@gateway/utils';
import {
	BotCommandActionResponseSchema,
	BotCommandNameParamSchema,
	BotCommandParamSchema,
	BotCommandSchema,
	CreateBotCommandSchema,
	UpdateBotCommandSchema
} from './schemas';

export const listBotCommandsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Bot Commands'],
	summary: 'List bot commands',
	description: 'Returns all registered bot commands.',
	responses: {
		200: response('Bot commands', z.array(BotCommandSchema))
	}
});

export const getBotCommandByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Get bot command by ID',
	request: { params: BotCommandParamSchema },
	responses: {
		200: response('Bot command', BotCommandSchema),
		404: response('Bot command not found')
	}
});

export const getBotCommandByNameRoute = createRoute({
	method: 'get',
	path: '/name/{commandName}',
	tags: ['Bot Commands'],
	summary: 'Get bot command by Name',
	request: { params: BotCommandNameParamSchema },
	responses: {
		200: response('Bot command', BotCommandSchema),
		404: response('Bot command not found')
	}
});

export const createBotCommandRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Bot Commands'],
	summary: 'Create bot command',
	request: {
		body: {
			required: true,
			content: { 'application/json': { schema: CreateBotCommandSchema } }
		}
	},
	responses: {
		201: response('Bot command created', BotCommandSchema),
		400: response('Invalid request')
	}
});

export const updateBotCommandRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Update bot command',
	request: {
		params: BotCommandParamSchema,
		body: {
			required: true,
			content: { 'application/json': { schema: UpdateBotCommandSchema } }
		}
	},
	responses: {
		200: response('Bot command updated', BotCommandSchema),
		404: response('Bot command not found')
	}
});

export const deleteBotCommandRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Bot Commands'],
	summary: 'Delete bot command',
	request: { params: BotCommandParamSchema },
	responses: {
		200: response('Bot command deleted', BotCommandActionResponseSchema),
		404: response('Bot command not found')
	}
});
