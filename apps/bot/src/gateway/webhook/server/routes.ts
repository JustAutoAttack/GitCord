import { createRoute } from '@hono/zod-openapi';

import { webhookResponseSchema } from '../base-schemas';
import {
	serverLifecyclePayloadSchema,
	tableUpdatePayloadSchema
} from './schemas';

export const lifecycleRoute = createRoute({
	method: 'post',
	path: '/lifecycle',
	tags: ['Webhooks'],
	summary: 'Server Lifecycle Webhook',
	description:
		'Outbound webhook dispatched by the server to notify the bot of startup and shutdown state changes.',
	request: {
		body: {
			content: {
				'application/json': { schema: serverLifecyclePayloadSchema }
			}
		}
	},
	responses: {
		200: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Webhook processed successfully by the bot'
		},
		401: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Unauthorized signature failure'
		}
	}
});

export const tableUpdateRoute = createRoute({
	method: 'post',
	path: '/table-update',
	tags: ['Webhooks'],
	summary: 'Database Table Update Webhook',
	description:
		'Outbound webhook dispatched by the server whenever a record is created, updated, or deleted, allowing the bot to invalidate its local cache.',
	request: {
		body: {
			content: {
				'application/json': { schema: tableUpdatePayloadSchema }
			}
		}
	},
	responses: {
		200: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Cache invalidated successfully by the bot'
		},
		401: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Unauthorized signature failure'
		}
	}
});

// Github
