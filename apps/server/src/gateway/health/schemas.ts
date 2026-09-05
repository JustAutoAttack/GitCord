import z from 'zod';

export const HealthResponseSchema = z.object({
	status: z.string().openapi({ example: 'UP' }),
	timestamp: z.string().openapi({ example: '2026-08-17T17:55:00.000Z' }),
	uptimeSeconds: z.number().optional().openapi({ example: 3600 }),
	checks: z
		.object({
			database: z.object({
				status: z.enum(['up', 'down']),
				latencyMs: z.number().optional().openapi({ example: 0.82 }),
				error: z.string().optional()
			})
		})
		.optional()
});
