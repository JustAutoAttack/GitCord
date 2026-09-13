import { RouteHandler } from '@hono/zod-openapi';
import type {
	InstallationEvent,
	InstallationRepositoriesEvent
} from '@octokit/webhooks-types';

import { ENV, httpLogger, webhookDispatcher } from '@core';
import type { GithubEventPayload } from '@core';
import {
	githubAppInstallationsService,
	githubRepositoriesService
} from '@services';
import { eventRoute } from './routes';

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
		httpLogger.info(
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
					httpLogger.info(
						`[GitHub Webhook] Added repository ${repo.full_name} via installation created event`
					);
				} catch (err) {
					httpLogger.error(
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
				httpLogger.info(
					`[GitHub Webhook] Deleted installation record for ID ${installationId}`
				);
			}
		} catch {
			httpLogger.warn(
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
		httpLogger.warn(
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
				httpLogger.info(
					`[GitHub Webhook] Added repository ${repo.full_name} via installation event`
				);
			} catch (err) {
				httpLogger.error(
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
					httpLogger.info(
						`[GitHub Webhook] Removed repository ${repo.full_name} via installation event`
					);
				}
			} catch (err) {
				httpLogger.error(
					`[GitHub Webhook] Failed to remove repository ${repo.full_name}:`,
					err
				);
			}
		}
	}
}

export const eventHandler: RouteHandler<typeof eventRoute> = async (ctx) => {
	const eventName = ctx.req.header('x-github-event') ?? 'unknown';

	const body = await ctx.req.json().catch((error) => {
		httpLogger.error('Failed to parse GitHub webhook JSON:', error);
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
			case 'security_advisory':
				httpLogger.debug(
					`[GitHub Webhook] Muted unhandled event: ${eventName}`
				);
				break;
			default:
				httpLogger.info(
					`[GitHub Webhook] Forwarding unhandled event ${eventName} to bot.`
				);
				if (ENV.BOT_WEBHOOK_URL && ENV.BOT_WEBHOOK_SECRET) {
					const githubEventUrl = new URL(
						'/github-event',
						ENV.BOT_WEBHOOK_URL
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
						httpLogger.error(
							`[GitHub Webhook] Failed to forward event ${eventName} to bot:`,
							err
						);
					}
				}
				break;
		}
	} catch (error) {
		httpLogger.error(
			`[GitHub Webhook] Error processing event ${eventName}:`,
			error
		);
		return ctx.json(
			{ success: false, error: 'Failed to process installation webhook' },
			500
		);
	}

	return ctx.json({ success: true }, 200);
};
