import { z } from '@hono/zod-openapi';

export const CommandNameParamSchema = z.object({
	commandName: z.string().openapi({
		example: 'sync',
		description: 'Bot Command Name'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({ example: 'cmd_123456' }),
	commandName: z.string().openapi({ example: 'sync' }),
	description: z
		.string()
		.openapi({ example: 'Synchronize repository branches' }),
	createdAt: z.string().openapi({ example: '2026-08-01T10:00:00.000Z' }),
	updatedAt: z.string().openapi({ example: '2026-08-17T14:30:00.000Z' })
});

export const CreateSchema = z.object({
	commandName: z.string().min(1).openapi({ example: 'sync' }),
	description: z
		.string()
		.min(1)
		.openapi({ example: 'Synchronize repository branches' })
});

export const UpdateSchema = z.object({
	commandName: z.string().min(1).optional().openapi({ example: 'sync' }),
	description: z
		.string()
		.min(1)
		.optional()
		.openapi({ example: 'Updated description' })
});
