import { RouteHandler } from '@hono/zod-openapi';
import type {
	InstallationEvent,
	InstallationRepositoriesEvent,
	RepositoryEvent
} from '@octokit/webhooks-types';

import { ENV, webhookDispatcher } from '@core';
import type { GithubEventPayload } from '@core';
import {
	githubAppInstallationsService,
	githubRepositoriesService
} from '@services';
import { eventRoute } from './routes';
import { logger } from '../logger';

async function handleInstallationEvent(body: InstallationEvent) {
	const installationId = body.installation.id;
	const account = body.installation.account as {
		login?: string;
		name?: string;
		type?: string;
	};
	const accountLogin = account.login ?? account.name ?? 'unknown';
	const accountType = account.type ?? 'User';

	if (body.action === 'created') {
		const installationRecord = await githubAppInstallationsService.create({
			installationId,
			accountLogin,
			accountType
		});
		logger.info(
			`[GitHub Webhook] Created installation record for ID ${installationId}`
		);

		if ('repositories' in body && Array.isArray(body.repositories)) {
			for (const repo of body.repositories) {
				try {
					await githubRepositoriesService.create({
						githubAppInstallationId: installationRecord.id,
						repositoryUrl: `https://github.com/${repo.full_name}`,
						repositoryFullName: repo.full_name
					});
					logger.info(
						`[GitHub Webhook] Added repository ${repo.full_name} via installation created event`
					);
				} catch (err) {
					logger.error(
						`[GitHub Webhook] Failed to add repository ${repo.full_name}:`,
						err
					);
				}
			}
		}
	} else if (body.action === 'deleted') {
		try {
			const record =
				await githubAppInstallationsService.getByInstallationId(
					installationId
				);
			if (record?.id) {
				await githubAppInstallationsService.delete(record.id);
				logger.info(
					`[GitHub Webhook] Deleted installation record for ID ${installationId}`
				);
			}
		} catch {
			logger.warn(
				`[GitHub Webhook] Installation record for ID ${installationId} not found for deletion.`
			);
		}
	}
}

async function handleInstallationRepositoriesEvent(
	body: InstallationRepositoriesEvent
) {
	const installationId = body.installation.id;

	let installationRecord: any;
	try {
		installationRecord =
			await githubAppInstallationsService.getByInstallationId(
				installationId
			);
	} catch {
		logger.warn(
			`[GitHub Webhook] App installation ${installationId} not found for repository sync.`
		);
		return;
	}

	if (!installationRecord) return;

	if (body.action === 'added' && body.repositories_added) {
		for (const repo of body.repositories_added) {
			try {
				await githubRepositoriesService.create({
					githubAppInstallationId: installationRecord.id,
					repositoryUrl: `https://github.com/${repo.full_name}`,
					repositoryFullName: repo.full_name
				});
				logger.info(
					`[GitHub Webhook] Added repository ${repo.full_name} via installation event`
				);
			} catch (err) {
				logger.error(
					`[GitHub Webhook] Failed to add repository ${repo.full_name}:`,
					err
				);
			}
		}
	} else if (body.action === 'removed' && body.repositories_removed) {
		for (const repo of body.repositories_removed) {
			try {
				const existingRepo =
					await githubRepositoriesService.getByRepositoryUrl(
						`https://github.com/${repo.full_name}`
					);
				if (existingRepo?.id) {
					await githubRepositoriesService.delete(existingRepo.id);
					logger.info(
						`[GitHub Webhook] Removed repository ${repo.full_name} via installation event`
					);
				}
			} catch (err) {
				logger.error(
					`[GitHub Webhook] Failed to remove repository ${repo.full_name}:`,
					err
				);
			}
		}
	}
}

async function handleRepositoryEvent(body: RepositoryEvent) {
	const action = body.action;
	const repo = body.repository;
	const currentFullName = repo.full_name;
	const currentUrl = repo.html_url;

	if (action === 'deleted') {
		try {
			const existingRepo =
				await githubRepositoriesService.getByRepositoryUrl(currentUrl);
			if (existingRepo?.id) {
				await githubRepositoriesService.delete(existingRepo.id);
				logger.info(
					`[GitHub Webhook] Deleted repository ${currentFullName} due to repository deletion`
				);
			}
		} catch (err) {
			logger.error(
				`[GitHub Webhook] Failed to delete repository ${currentFullName}:`,
				err
			);
		}
	} else if (
		action === 'renamed' &&
		'changes' in body &&
		body.changes?.repository?.name
	) {
		const oldNameFrom = body.changes.repository.name.from;
		const owner = repo.owner.login;
		const oldFullName = `${owner}/${oldNameFrom}`;
		const oldUrl = `https://github.com/${oldFullName}`;

		try {
			const existingRepo =
				await githubRepositoriesService.getByRepositoryUrl(oldUrl);
			if (existingRepo?.id) {
				await githubRepositoriesService.delete(existingRepo.id);
				await githubRepositoriesService.create({
					githubAppInstallationId:
						existingRepo.githubAppInstallationId,
					repositoryUrl: currentUrl,
					repositoryFullName: currentFullName
				});
				logger.info(
					`[GitHub Webhook] Updated renamed repository from ${oldFullName} to ${currentFullName}`
				);
			}
		} catch (err) {
			logger.error(
				`[GitHub Webhook] Failed to update renamed repository ${currentFullName}:`,
				err
			);
		}
	}
}

export const eventHandler: RouteHandler<typeof eventRoute> = async (ctx) => {
	const eventName = ctx.req.header('x-github-event') ?? 'unknown';

	const body = await ctx.req.json().catch((error) => {
		logger.error('Failed to parse GitHub webhook JSON:', error);
		return null;
	});

	if (!body) {
		return ctx.json(
			{ success: false, error: 'Failed to parse GitHub webhook JSON' },
			400
		);
	}

	try {
		switch (eventName) {
			case 'installation':
				await handleInstallationEvent(body as InstallationEvent);
				break;
			case 'installation_repositories':
				await handleInstallationRepositoriesEvent(
					body as InstallationRepositoriesEvent
				);
				break;
			case 'repository':
				await handleRepositoryEvent(body as RepositoryEvent);
				break;
			case 'security_advisory':
				logger.debug(
					`[GitHub Webhook] Muted unhandled event: ${eventName}`
				);
				break;
			default:
				logger.info(
					`[GitHub Webhook] Forwarding unhandled event ${eventName} to bot.`
				);
				if (ENV.BOT_WEBHOOK_URL && ENV.BOT_WEBHOOK_SECRET) {
					const githubEventUrl = new URL(
						'github',
						ENV.BOT_WEBHOOK_URL.endsWith('/')
							? ENV.BOT_WEBHOOK_URL
							: `${ENV.BOT_WEBHOOK_URL}/`
					).toString();
					const payload: GithubEventPayload = {
						timestamp: Date.now(),
						data: {
							eventName,
							payload: body
						}
					};
					try {
						await webhookDispatcher.broadcast(
							githubEventUrl,
							ENV.BOT_WEBHOOK_SECRET,
							payload
						);
					} catch (err) {
						logger.error(
							`[GitHub Webhook] Failed to forward event ${eventName} to bot:`,
							err
						);
					}
				}
				break;
		}
	} catch (error) {
		logger.error(
			`[GitHub Webhook] Error processing event ${eventName}:`,
			error
		);
		return ctx.json(
			{ success: false, error: 'Failed to process webhook event' },
			500
		);
	}

	return ctx.json({ success: true }, 200);
};
