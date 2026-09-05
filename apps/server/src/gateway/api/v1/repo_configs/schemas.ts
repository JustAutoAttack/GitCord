import { z } from '@hono/zod-openapi';

export const RepoConfigParamSchema = z.object({
	id: z.string().openapi({
		example: 'cfg_123456',
		description: 'Repo Configuration ID'
	})
});

export const CommandChannelParamSchema = z.object({
	commandChannelId: z.string().openapi({
		example: '123456789012345679',
		description: 'Command Channel ID'
	})
});

export const RepoConfigSchema = z.object({
	id: z.string().openapi({
		example: 'cfg_123456'
	}),

	guildId: z.string().openapi({
		example: '123456789012345678'
	}),

	commandChannelId: z.string().openapi({
		example: '123456789012345679'
	}),

	notificationChannelId: z.string().openapi({
		example: '123456789012345680'
	}),

	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),

	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateRepoConfigSchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),

	commandChannelId: z.string().min(1).openapi({
		example: '123456789012345679'
	}),

	notificationChannelId: z.string().min(1).openapi({
		example: '123456789012345680'
	})
});

export const UpdateRepoConfigSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),

	commandChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345679'
	}),

	notificationChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345680'
	})
});

export const RepoConfigActionResponseSchema = z.object({
	success: z.boolean().openapi({
		example: true
	}),

	message: z.string().openapi({
		example: 'Operation completed successfully'
	})
});
