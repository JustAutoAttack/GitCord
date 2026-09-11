import { z } from '@hono/zod-openapi';

export const serverLifecyclePayloadSchema = z.object({
	timestamp: z.number().openapi({ example: 1723917300000 }),
	data: z.object({
		status: z
			.enum(['ONLINE', 'OFFLINE', 'STARTING', 'SHUTTING_DOWN'])
			.openapi({ example: 'SHUTTING_DOWN' }),
		reason: z
			.string()
			.optional()
			.openapi({ example: 'SIGTERM signal received' })
	})
});

export const webhookResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	error: z.string().optional().openapi({ example: 'Invalid signature' })
});

export type ServerLifecyclePayload = z.infer<
	typeof serverLifecyclePayloadSchema
>;
export type WebhookResponse = z.infer<typeof webhookResponseSchema>;
