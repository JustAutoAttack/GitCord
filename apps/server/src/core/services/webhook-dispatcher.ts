import { cryptoService } from './crypto';
import { appLogger } from '../loggers';

export interface BaseWebhookPayload<TData = Record<string, unknown>> {
	readonly type: string;
	readonly timestamp: number;
	readonly data: TData;
}

export class WebhookDispatcherService {
	public async broadcast<T extends BaseWebhookPayload>(
		endpointUrl: string,
		secret: string,
		payload: T
	): Promise<void> {
		const rawBody = JSON.stringify(payload);
		const signature = cryptoService.createHmacSha256(secret, rawBody);

		try {
			const response = await fetch(endpointUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-GitCord-Signature': signature
				},
				body: rawBody
			});

			if (!response.ok) {
				appLogger.error(
					`Failed to dispatch webhook to ${endpointUrl}: ${response.statusText}`
				);
			}
		} catch (error) {
			appLogger.error(
				`Network error dispatching webhook to ${endpointUrl}:`,
				error
			);
		}
	}
}

export const webhookDispatcher = new WebhookDispatcherService();
