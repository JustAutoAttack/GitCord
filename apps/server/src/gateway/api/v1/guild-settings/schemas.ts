import { z } from '@hono/zod-openapi';

export const ListQuerySchema = z.object({
	notifyOnConnection: z
		.preprocess((val) => {
			if (val === 'true' || val === '1') return true;
			if (val === 'false' || val === '0') return false;
			return val;
		}, z.boolean().optional())
		.openapi({
			type: 'boolean',
			example: true,
			description:
				'Filter guild settings by whether they notify on connection'
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

export const ReadSchema = z.object({
	id: z.string().openapi({
		example: 'set_123456'
	}),
	guildId: z.string().openapi({
		example: '123456789012345678'
	}),
	systemChannelId: z.string().openapi({
		example: '123456789012345679'
	}),
	notifyOnConnection: z.boolean().openapi({
		example: true,
		description: 'Whether to notify on connection'
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
	systemChannelId: z.string().min(1).openapi({
		example: '123456789012345679'
	}),
	notifyOnConnection: z.boolean().optional().openapi({
		example: true,
		description: 'Whether to notify on connection'
	})
});

export const UpdateSchema = z.object({
	guildId: z.string().min(1).optional().openapi({
		example: '123456789012345678'
	}),
	systemChannelId: z.string().min(1).optional().openapi({
		example: '123456789012345679'
	}),
	notifyOnConnection: z.boolean().optional().openapi({
		example: true,
		description: 'Whether to notify on connection'
	})
});
