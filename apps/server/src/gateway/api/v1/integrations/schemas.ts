import { z } from '@hono/zod-openapi';

export const DiscordBotInstallCallbackQuerySchema = z.object({
	guild_id: z.string().openapi({
		example: '123456789012345678',
		description: 'Discord Guild ID where the bot was added'
	}),
	permissions: z.string().optional().openapi({
		example: '8',
		description: 'Discord permissions bitwise integer string'
	}),
	state: z.string().optional().openapi({
		example: 'eyJhbGciOiJIUzI1NiIsIn...',
		description: 'Secure state token'
	})
});

export const IntegrationSuccessSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	message: z
		.string()
		.openapi({ example: 'Integration configured successfully' }),
	data: z.record(z.any()).optional()
});
