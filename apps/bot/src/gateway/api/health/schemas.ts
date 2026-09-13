import { z } from '@hono/zod-openapi';

export const integrationCheckSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	message: z
		.string()
		.openapi({ example: 'Integration is active and responsive' }),
	latencyMs: z.number().optional().openapi({ example: 0.82 })
});

export const HealthResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	message: z.string().openapi({ example: 'Service is operational' }),
	timestamp: z.string().openapi({ example: '2026-09-11T17:55:00.000Z' }),
	uptimeSeconds: z.number().optional().openapi({ example: 3600 }),
	checks: z
		.object({
			github: integrationCheckSchema,
			server: integrationCheckSchema
		})
		.optional()
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
