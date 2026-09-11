import { z } from '@hono/zod-openapi';

export const UserSessionParamSchema = z.object({
	id: z.string().openapi({
		example: 'sess_123456',
		description: 'User Session ID'
	})
});

export const UserSessionUserIdParamSchema = z.object({
	userId: z.string().openapi({
		example: 'usr_123456',
		description: 'User ID'
	})
});

export const UserSessionSchema = z.object({
	id: z.string().openapi({
		example: 'sess_123456'
	}),
	userId: z.string().openapi({
		example: 'usr_123456'
	}),
	accessTokenEncrypted: z.string().openapi({
		example: 'encrypted_access_token_string'
	}),
	refreshTokenEncrypted: z.string().openapi({
		example: 'encrypted_refresh_token_string'
	}),
	expiresAt: z.string().openapi({
		example: '2026-09-17T14:30:00.000Z'
	}),
	updatedAt: z.string().openapi({
		example: '2026-08-17T14:30:00.000Z'
	}),
	createdAt: z.string().openapi({
		example: '2026-08-01T10:00:00.000Z'
	})
});

export const CreateUserSessionSchema = z.object({
	userId: z.string().min(1).openapi({
		example: 'usr_123456'
	}),
	accessTokenEncrypted: z.string().min(1).openapi({
		example: 'encrypted_access_token_string'
	}),
	refreshTokenEncrypted: z.string().min(1).openapi({
		example: 'encrypted_refresh_token_string'
	}),
	expiresAt: z.string().min(1).openapi({
		example: '2026-09-17T14:30:00.000Z'
	})
});

export const UpdateUserSessionSchema = z.object({
	userId: z.string().min(1).optional().openapi({
		example: 'usr_123456'
	}),
	accessTokenEncrypted: z.string().min(1).optional().openapi({
		example: 'encrypted_access_token_string'
	}),
	refreshTokenEncrypted: z.string().min(1).optional().openapi({
		example: 'encrypted_refresh_token_string'
	}),
	expiresAt: z.string().min(1).optional().openapi({
		example: '2026-09-17T14:30:00.000Z'
	})
});

export const UserSessionActionResponseSchema = z.object({
	success: z.boolean().openapi({
		example: true
	}),
	message: z.string().openapi({
		example: 'Operation completed successfully'
	})
});
