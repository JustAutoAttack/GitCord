import { z } from '@hono/zod-openapi';

export const ListQuerySchema = z.object({
	githubAppInstallationId: z.string().optional().openapi({
		example: '12345678',
		description: 'Filter GitHub repositories by GitHub App Installation ID'
	})
});

export const GetByUrlQuerySchema = z.object({
	repositoryUrl: z.string().min(1).url().openapi({
		example: 'https://github.com/gitcord-org/core-service',
		description: 'Repository URL'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'repo_123456'
	}),
	githubAppInstallationId: z.string().openapi({
		example: '12345678'
	}),
	repositoryUrl: z.string().url().openapi({
		example: 'https://github.com/gitcord-org/core-service'
	}),
	repositoryFullName: z.string().openapi({
		example: 'gitcord-org/core-service'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateSchema = z.object({
	githubAppInstallationId: z.string().min(1).openapi({
		example: '12345678'
	}),
	repositoryUrl: z.string().min(1).url().openapi({
		example: 'https://github.com/gitcord-org/core-service'
	}),
	repositoryFullName: z.string().min(1).openapi({
		example: 'gitcord-org/core-service'
	})
});

export const UpdateSchema = z.object({
	githubAppInstallationId: z.string().min(1).optional().openapi({
		example: '12345678'
	}),
	repositoryUrl: z.string().min(1).url().optional().openapi({
		example: 'https://github.com/gitcord-org/core-service'
	}),
	repositoryFullName: z.string().min(1).optional().openapi({
		example: 'gitcord-org/core-service'
	})
});
