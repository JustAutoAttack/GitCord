import { z } from '@hono/zod-openapi';

export const ListQuerySchema = z.object({
	guildId: z.string().optional().openapi({
		example: '123456789012345678',
		description: 'Filter guild repositories by Guild ID'
	}),
	githubRepositoryId: z.string().optional().openapi({
		example: 'repo_123456',
		description: 'Filter guild repositories by GitHub Repository ID'
	})
});

export const GetByGuildAndGithubRepositoryQuerySchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678',
		description: 'Guild ID'
	}),
	githubRepositoryId: z.string().min(1).openapi({
		example: 'repo_123456',
		description: 'GitHub Repository ID'
	})
});

export const CommandChannelParamSchema = z.object({
	commandChannelId: z.string().openapi({
		example: '123456789012345679',
		description: 'Command Channel ID'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'cfg_123456'
	}),
	guildId: z.string().openapi({
		example: '123456789012345678'
	}),
	githubRepositoryId: z.string().openapi({
		example: 'repo_123456'
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

export const CreateSchema = z.object({
	guildId: z.string().min(1).openapi({
		example: '123456789012345678'
	}),
	githubRepositoryId: z.string().min(1).openapi({
		example: 'repo_123456'
	}),
	commandChannelId: z.string().min(1).openapi({
		example: '123456789012345679'
	}),
	notificationChannelId: z.string().min(1).openapi({
		example: '123456789012345680'
	})
});

export const UpdateSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),
	githubRepositoryId: z.string().min(1).optional().openapi({
		example: 'repo_123456'
	}),
	commandChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345679'
	}),
	notificationChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345680'
	})
});
