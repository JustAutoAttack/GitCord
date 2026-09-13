import { cryptoService } from './crypto';
import { appLogger } from '../loggers';
import type { WebhookPayload } from '../types';

export class WebhookDispatcherService {
	public async broadcast(
		endpointUrl: string,
		secret: string,
		payload: WebhookPayload
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
				appLogger.warn(
					`Failed to dispatch webhook to ${endpointUrl}: ${response.statusText}`
				);
			}
		} catch (error: any) {
			if (
				error?.cause?.code === 'ECONNREFUSED' ||
				error?.code === 'ECONNREFUSED'
			) {
				appLogger.warn(
					`Network error dispatching webhook to ${endpointUrl}: Target endpoint is offline.`
				);
			} else {
				appLogger.warn(
					`Network error dispatching webhook to ${endpointUrl}: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}
	}
}

export const webhookDispatcher = new WebhookDispatcherService();
