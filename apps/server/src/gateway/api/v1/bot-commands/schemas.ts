import { z } from '@hono/zod-openapi';

export const BotCommandParamSchema = z.object({
	id: z.string().openapi({
		example: 'cmd_123456',
		description: 'Bot Command ID'
	})
});

export const BotCommandNameParamSchema = z.object({
	commandName: z.string().openapi({
		example: 'sync',
		description: 'Bot Command Name'
	})
});

export const BotCommandSchema = z.object({
	id: z.string().openapi({ example: 'cmd_123456' }),
	commandName: z.string().openapi({ example: 'sync' }),
	description: z
		.string()
		.openapi({ example: 'Synchronize repository branches' }),
	createdAt: z.string().openapi({ example: '2026-08-01T10:00:00.000Z' }),
	updatedAt: z.string().openapi({ example: '2026-08-17T14:30:00.000Z' })
});

export const CreateBotCommandSchema = z.object({
	commandName: z.string().min(1).openapi({ example: 'sync' }),
	description: z
		.string()
		.min(1)
		.openapi({ example: 'Synchronize repository branches' })
});

export const UpdateBotCommandSchema = z.object({
	commandName: z.string().min(1).optional().openapi({ example: 'sync' }),
	description: z
		.string()
		.min(1)
		.optional()
		.openapi({ example: 'Updated description' })
});

export const BotCommandActionResponseSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	message: z.string().openapi({ example: 'Operation completed successfully' })
});
