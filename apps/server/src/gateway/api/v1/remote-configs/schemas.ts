import { z } from '@hono/zod-openapi';

export const ListRemoteConfigsQuerySchema = z.object({
	guildId: z.string().optional().openapi({
		example: '123456789012345678',
		description: 'Filter remote configurations by Guild ID'
	})
});

export const GetByGuildAndRemoteQuerySchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678',
		description: 'Guild ID'
	}),
	repositoryUrl: z.string().min(1).url().openapi({
		example: 'https://github.com/gitcord-org/core-service',
		description: 'Repository URL'
	})
});

export const RemoteConfigParamSchema = z.object({
	id: z.string().openapi({
		example: 'cfg_123456',
		description: 'Remote Configuration ID'
	})
});

export const CommandChannelParamSchema = z.object({
	commandChannelId: z.string().openapi({
		example: '123456789012345679',
		description: 'Command Channel ID'
	})
});

export const RemoteConfigSchema = z.object({
	id: z.string().openapi({
		example: 'cfg_123456'
	}),

	guildId: z.string().openapi({
		example: '123456789012345678'
	}),

	repositoryUrl: z.string().url().openapi({
		example: 'https://github.com/gitcord-org/core-service'
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

export const CreateRemoteConfigSchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),

	repositoryUrl: z.string().min(1).url().openapi({
		example: 'https://github.com/gitcord-org/core-service'
	}),

	commandChannelId: z.string().min(1).openapi({
		example: '123456789012345679'
	}),

	notificationChannelId: z.string().min(1).openapi({
		example: '123456789012345680'
	})
});

export const UpdateRemoteConfigSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),

	repositoryUrl: z.string().min(1).url().optional().openapi({
		example: 'https://github.com/gitcord-org/another-repo'
	}),

	commandChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345679'
	}),

	notificationChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345680'
	})
});

export const RemoteConfigActionResponseSchema = z.object({
	success: z.boolean().openapi({
		example: true
	}),

	message: z.string().openapi({
		example: 'Operation completed successfully'
	})
});
