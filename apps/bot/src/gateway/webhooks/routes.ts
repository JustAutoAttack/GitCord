import { createRoute, z } from '@hono/zod-openapi';

import { serverLifecyclePayloadSchema, webhookResponseSchema } from './schemas';

export const serverWebhookRoute = createRoute({
	method: 'post',
	path: '/server',
	tags: ['Webhooks'],
	summary: 'Server Lifecycle Webhook',
	description: 'Ingests state synchronization events from the API server.',
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
			description: 'Webhook processed successfully'
		},
		401: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Unauthorized signature failure'
		}
	}
});

export const githubWebhookRoute = createRoute({
	method: 'post',
	path: '/github',
	tags: ['Webhooks'],
	summary: 'GitHub Webhook',
	description: 'Ingests repository event payloads directly from GitHub.',
	request: {
		body: {
			content: {
				'application/json': { schema: z.record(z.any()) }
			}
		}
	},
	responses: {
		200: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'GitHub webhook processed successfully'
		}
	}
});
