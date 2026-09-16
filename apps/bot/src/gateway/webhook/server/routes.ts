import { createRoute, z } from '@hono/zod-openapi';

import { webhookResponseSchema } from '../base-schemas';
import {
	githubEventPayloadSchema,
	serverLifecyclePayloadSchema,
	tableUpdatePayloadSchema
} from './schemas';

const errorResponseSchema = z.object({
	success: z.boolean().openapi({ example: false }),
	error: z.string().optional().openapi({ example: 'Invalid signature' })
});

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
		400: {
			content: {
				'application/json': { schema: errorResponseSchema }
			},
			description: 'Bad request or validation failure'
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
		400: {
			content: {
				'application/json': { schema: errorResponseSchema }
			},
			description: 'Bad request or validation failure'
		},
		401: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Unauthorized signature failure'
		}
	}
});

export const githubEventRoute = createRoute({
	method: 'post',
	path: '/github',
	tags: ['Webhooks'],
	summary: 'GitHub Event Webhook',
	description:
		'Outbound webhook dispatched by the server to forward GitHub events to the bot.',
	request: {
		body: {
			content: {
				'application/json': { schema: githubEventPayloadSchema }
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
		400: {
			content: {
				'application/json': { schema: errorResponseSchema }
			},
			description: 'Bad request or validation failure'
		},
		401: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Unauthorized signature failure'
		}
	}
});
