import { z } from '@hono/zod-openapi';

export const AuthClientSchema = z.enum(['browser', 'tauri']);

export const SignUpQuerySchema = z.object({
	client: AuthClientSchema.openapi({
		example: 'browser',
		description: 'Client initiating the authentication flow'
	})
});

export const DiscordCallbackQuerySchema = z.object({
	code: z.string().min(1).openapi({
		example: 'discord_auth_code_123',
		description: 'Discord OAuth authorization code'
	}),
	state: z.string().min(1).openapi({
		example: '...',
		description: 'OAuth state containing the originating client'
	})
});

export const UserResponseSchema = z.object({
	id: z.string().openapi({ example: 'usr_123456' }),
	discordId: z.string().openapi({ example: '123456789012345678' }),
	displayName: z.string().openapi({ example: 'discord_user' }),
	avatarUrl: z
		.string()
		.nullable()
		.openapi({ example: 'https://cdn.discordapp.com/avatars/...' }),
	createdAt: z.string().openapi({ example: '2026-08-01T10:00:00.000Z' }),
	updatedAt: z.string().openapi({ example: '2026-08-17T14:30:00.000Z' })
});

export const AuthSuccessSchema = z.object({
	success: z.boolean().openapi({ example: true }),
	data: z.object({
		user: UserResponseSchema
	})
});
