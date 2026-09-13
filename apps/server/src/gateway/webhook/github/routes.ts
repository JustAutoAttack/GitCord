import { createRoute, z } from '@hono/zod-openapi';
import { webhookResponseSchema } from '../base-schemas';

export const eventRoute = createRoute({
	method: 'post',
	path: '/',
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
		},
		400: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Invalid GitHub webhook payload'
		},
		500: {
			content: {
				'application/json': { schema: webhookResponseSchema }
			},
			description: 'Internal server error processing webhook'
		}
	}
});
