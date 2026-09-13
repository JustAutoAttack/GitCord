import { z } from '@hono/zod-openapi';
import type {
	ServerLifecycleWebhookPayload,
	TableUpdateWebhookPayload
} from '@gitcord/server-api';

export const serverLifecyclePayloadSchema = z.object({
	type: z.string().openapi({ example: 'SERVER_LIFECYCLE' }),
	timestamp: z.number().openapi({ example: 1723917300000 }),
	data: z.object({
		status: z
			.enum(['ONLINE', 'OFFLINE', 'STARTING', 'SHUTTING_DOWN'])
			.openapi({ example: 'ONLINE' }),
		reason: z
			.string()
			.optional()
			.openapi({ example: 'Server startup complete' })
	})
}) as unknown as z.ZodType<ServerLifecycleWebhookPayload>;

export const tableUpdatePayloadSchema = z.object({
	type: z.string().openapi({ example: 'TABLE_UPDATE' }),
	timestamp: z.number().openapi({ example: 1723917300000 }),
	data: z.object({
		tableName: z.string().openapi({ example: 'guild_settings' }),
		action: z
			.enum(['CREATE', 'UPDATE', 'DELETE'])
			.openapi({ example: 'UPDATE' }),
		recordId: z.string().openapi({ example: '1234567890' }),
		record: z.record(z.any()).nullable().optional()
	})
}) as unknown as z.ZodType<TableUpdateWebhookPayload>;



export type ServerLifecyclePayload = ServerLifecycleWebhookPayload;
export type TableUpdatePayload = TableUpdateWebhookPayload;
