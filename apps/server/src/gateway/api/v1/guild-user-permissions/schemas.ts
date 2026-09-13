import { z } from '@hono/zod-openapi';

export const ListQuerySchema = z.object({
	guildId: z.string().optional().openapi({
		example: '123456789012345678',
		description: 'Filter permissions by Guild ID'
	})
});

export const GetByGuildAndUserQuerySchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678',
		description: 'Guild ID'
	}),
	discordUserId: z.string().min(1).openapi({
		example: '987654321098765432',
		description: 'Discord User ID'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'perm_123456'
	}),
	guildId: z.string().openapi({
		example: '123456789012345678'
	}),
	discordUserId: z.string().openapi({
		example: '987654321098765432'
	}),
	commandId: z.string().openapi({
		example: 'cmd_123456'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateSchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),
	discordUserId: z.string().min(1).openapi({
		example: '987654321098765432'
	}),
	commandId: z.string().min(1).openapi({
		example: 'cmd_123456'
	})
});

export const UpdateSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),
	discordUserId: z.string().min(1).optional().openapi({
		example: '987654321098765432'
	}),
	commandId: z.string().min(1).optional().openapi({
		example: 'cmd_123456'
	})
});
