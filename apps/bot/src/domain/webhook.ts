export namespace WebhookPayload {
	export type ServerStatus =
		| 'ONLINE'
		| 'OFFLINE'
		| 'STARTING'
		| 'SHUTTING_DOWN';

	export interface ServerLifecycle {
		type: string;
		timestamp: number;
		data: {
			status: ServerStatus | string;
			reason?: string;
		};
	}

	export interface TableUpdate {
		type: string;
		timestamp: number;
		data: {
			tableName: string;
			action: 'CREATE' | 'UPDATE' | 'DELETE';
			recordId: string;
			record?: Record<string, any> | null;
		};
	}

	export interface WebhookResponse {
		success: boolean;
		error?: string;
	}
}
