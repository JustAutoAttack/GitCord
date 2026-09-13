import { z } from '@hono/zod-openapi';

export const DiscordIDParamSchema = z.object({
	discordId: z.string().openapi({
		example: '123456789012345678',
		description: 'Discord User ID'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'usr_123456'
	}),
	discordId: z.string().openapi({
		example: '123456789012345678'
	}),
	displayName: z.string().openapi({
		example: 'JohnDoe'
	}),
	avatarUrl: z.string().nullable().openapi({
		example: 'https://cdn.discordapp.com/avatars/123/abc.png'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateSchema = z.object({
	discordId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),
	displayName: z.string().min(1).openapi({
		example: 'JohnDoe'
	}),
	avatarUrl: z.string().url().optional().nullable().openapi({
		example: 'https://cdn.discordapp.com/avatars/123/abc.png'
	})
});

export const UpdateSchema = z.object({
	displayName: z.string().min(1).optional().openapi({
		example: 'JohnDoeUpdated'
	}),
	avatarUrl: z.string().url().optional().nullable().openapi({
		example: 'https://cdn.discordapp.com/avatars/123/abc.png'
	})
});
