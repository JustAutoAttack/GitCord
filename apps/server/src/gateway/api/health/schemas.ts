import z from 'zod';

export const HealthResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	message: z.string().openapi({ example: 'Service is operational' }),
	timestamp: z.string().openapi({ example: '2026-08-17T17:55:00.000Z' }),
	uptimeSeconds: z.number().optional().openapi({ example: 3600 }),
	checks: z
		.object({
			database: z.object({
				success: z.boolean().openapi({ example: true }),
				message: z
					.string()
					.openapi({
						example: 'Database connection is active and responsive'
					}),
				latencyMs: z.number().optional().openapi({ example: 0.82 })
			})
		})
		.optional()
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
