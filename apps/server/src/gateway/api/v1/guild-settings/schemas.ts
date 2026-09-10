import { z } from '@hono/zod-openapi';

export const GuildSettingParamSchema = z.object({
	id: z.string().openapi({
		example: 'set_123456',
		description: 'Guild Setting ID'
	})
});

export const GuildIdParamSchema = z.object({
	guildId: z.string().openapi({
		example: '123456789012345678',
		description: 'Guild ID'
	})
});

export const SystemChannelParamSchema = z.object({
	systemChannelId: z.string().openapi({
		example: '123456789012345679',
		description: 'System Channel ID'
	})
});

export const GuildSettingSchema = z.object({
	id: z.string().openapi({
		example: 'set_123456'
	}),
	guildId: z.string().openapi({
		example: '123456789012345678'
	}),
	systemChannelId: z.string().openapi({
		example: '123456789012345679'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateGuildSettingSchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),
	systemChannelId: z.string().min(1).openapi({
		example: '123456789012345679'
	})
});

export const UpdateGuildSettingSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),
	systemChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345679'
	})
});

export const GuildSettingActionResponseSchema = z.object({
	success: z.boolean().openapi({
		example: true
	}),
	message: z.string().openapi({
		example: 'Operation completed successfully'
	})
});
