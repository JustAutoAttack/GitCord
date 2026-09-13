import type { WebhookEvent } from '@octokit/webhooks-types';
import { ContainerBuilder } from 'discord.js';

import { logger } from '../logger';
import { handleEvent } from './event-handlers';

export interface ParsedGitHubWebhook {
	repositoryUrl: string;
	repositoryFullName?: string;
	container: ContainerBuilder;
}

export interface IGitHubWebhookService {
	parseWebhook(
		event: string | undefined,
		body: unknown
	): ParsedGitHubWebhook | null;
}

export const GitHubWebhookService: IGitHubWebhookService = {
	parseWebhook(
		event: string | undefined,
		body: unknown
	): ParsedGitHubWebhook | null {
		logger.info(`Received GitHub webhook: ${event ?? 'unknown'}`);

		if (!body || typeof body !== 'object') {
			logger.error('GitHub webhook contained no valid body.');
			return null;
		}

		const webhookEvent = body as WebhookEvent;
		const repository =
			'repository' in webhookEvent ? webhookEvent.repository : undefined;
		const repositoryUrl = repository?.html_url;
		const repositoryFullName = repository?.full_name;

		if (!repositoryUrl) {
			logger.warn(
				'Rejected webhook: Payload missing repository URL.'
			);
			return null;
		}

		const container = handleEvent(event, webhookEvent);

		if (!container) {
			logger.debug(
				`Ignoring unsupported GitHub event: ${event ?? 'unknown'}`
			);
			return null;
		}

		return {
			repositoryUrl,
			repositoryFullName,
			container
		};
	}
};
