import { z } from '@hono/zod-openapi';

export const IDParamSchema = z.object({
	id: z.string().openapi({
		example: 'rec_123456',
		description: 'Record ID'
	})
});

export const ResponseSchema = z.object({
	success: z.boolean().openapi({
		example: true
	}),
	message: z.string().openapi({
		example: 'Operation completed successfully'
	})
});
