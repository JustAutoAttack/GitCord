export namespace WebhookPayload {
	export type ServerStatus =
		| 'ONLINE'
		| 'OFFLINE'
		| 'STARTING'
		| 'SHUTTING_DOWN';

	export interface ServerLifecycle {
		timestamp: number;
		data: {
			status: ServerStatus;
			reason?: string;
		};
	}

	export interface WebhookResponse {
		success: boolean;
		error?: string;
	}
}
