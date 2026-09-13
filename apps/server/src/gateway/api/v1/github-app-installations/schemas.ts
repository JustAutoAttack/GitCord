import { z } from '@hono/zod-openapi';

export const InstallationIDParamSchema = z.object({
	installationId: z.string().openapi({
		example: '12345678',
		description: 'GitHub App Installation ID'
	})
});

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'inst_123456'
	}),
	installationId: z.number().openapi({
		example: 12345678
	}),
	accountLogin: z.string().openapi({
		example: 'gitcord-org'
	}),
	accountType: z.string().openapi({
		example: 'Organization'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateSchema = z.object({
	installationId: z.number().openapi({
		example: 12345678
	}),
	accountLogin: z.string().min(1).openapi({
		example: 'gitcord-org'
	}),
	accountType: z.string().min(1).openapi({
		example: 'Organization'
	})
});

export const UpdateSchema = z.object({
	installationId: z.number().optional().openapi({
		example: 12345678
	}),
	accountLogin: z.string().min(1).optional().openapi({
		example: 'gitcord-org'
	}),
	accountType: z.string().min(1).optional().openapi({
		example: 'Organization'
	})
});
