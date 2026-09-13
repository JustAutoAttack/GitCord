import type { WebhookEvent, InstallationEvent } from '@octokit/webhooks-types';
import { ContainerBuilder } from 'discord.js';

import {
	ServerAPIGithubAppInstallationsService,
	ServerAPIGithubRepositoriesService
} from '@features/server';
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
	): Promise<ParsedGitHubWebhook | null>;
}

export const GitHubWebhookService: IGitHubWebhookService = {
	async parseWebhook(
		event: string | undefined,
		body: unknown
	): Promise<ParsedGitHubWebhook | null> {
		logger.info(`Received GitHub webhook: ${event ?? 'unknown'}`);

		if (!body || typeof body !== 'object') {
			logger.error('GitHub webhook contained no valid body.');
			return null;
		}

		const webhookEvent = body as WebhookEvent;

		if (event === 'installation') {
			await handleInstallationEvent(
				webhookEvent as unknown as InstallationEvent
			);
			return null;
		}

		await ensureInstallationRecord(webhookEvent);

		const repository =
			'repository' in webhookEvent ? webhookEvent.repository : undefined;
		const repositoryUrl = repository?.html_url;
		const repositoryFullName = repository?.full_name;

		if (!repositoryUrl) {
			logger.warn('Rejected webhook: Payload missing repository URL.');
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

async function handleInstallationEvent(
	payload: InstallationEvent
): Promise<void> {
	const action = payload.action;
	const installationId = payload.installation?.id;
	const account = payload.installation?.account;

	if (!installationId) return;

	if (action === 'created') {
		logger.info(
			`[GitHub App] Installed on account ${account?.login} (ID: ${installationId})`
		);
		try {
			const existing =
				await ServerAPIGithubAppInstallationsService.getByInstallationId(
					installationId
				).catch(() => null);
			if (!existing) {
				await ServerAPIGithubAppInstallationsService.create({
					installationId,
					accountLogin: account?.login ?? 'unknown',
					accountType: account?.type ?? 'Unknown'
				});
			}
		} catch (error) {
			logger.error(
				'Failed to create installation record on install:',
				error
			);
		}
	} else if (action === 'deleted') {
		logger.info(
			`[GitHub App] Uninstalled from account ${account?.login} (ID: ${installationId})`
		);
		try {
			const record =
				await ServerAPIGithubAppInstallationsService.getByInstallationId(
					installationId
				).catch(() => null);
			if (record && record.id) {
				const repos = await ServerAPIGithubRepositoriesService.list(
					record.id
				).catch(() => []);
				const reposArray = Array.isArray(repos)
					? repos
					: ((repos as any)?.data ?? []);
				for (const repo of reposArray) {
					await ServerAPIGithubRepositoriesService.delete(repo.id);
				}
				await ServerAPIGithubAppInstallationsService.delete(record.id);
			}
		} catch (error) {
			logger.error(
				'Failed to cleanup repository records on uninstall:',
				error
			);
		}
	}
}

async function ensureInstallationRecord(
	webhookEvent: WebhookEvent
): Promise<void> {
	const payloadInstallation = (webhookEvent as any).installation;
	if (!payloadInstallation || !payloadInstallation.id) return;

	const numericId = payloadInstallation.id;
	try {
		await ServerAPIGithubAppInstallationsService.getByInstallationId(
			numericId
		);
	} catch {
		logger.warn(
			`[Auto-Recovery] Missing installation record for ID ${numericId}. Registering on-the-fly...`
		);
		const account = payloadInstallation.account;
		await ServerAPIGithubAppInstallationsService.create({
			installationId: numericId,
			accountLogin: account?.login ?? 'unknown',
			accountType: account?.type ?? 'Unknown'
		}).catch((err) =>
			logger.error('Failed auto-registering installation record:', err)
		);
	}
}
