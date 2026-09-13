import { z } from '@hono/zod-openapi';

export const webhookResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	error: z.string().optional().openapi({ example: 'Invalid signature' })
});
