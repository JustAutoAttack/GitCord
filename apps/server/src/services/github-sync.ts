import { appLogger, ENV } from '@core';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

import { githubAppInstallationsService } from './github-app-installations';
import { githubRepositoriesService } from './github-repositories';

export class GitHubSyncService {
	async syncInstallations(): Promise<void> {
		if (!ENV.GITHUB_APP_ID || !ENV.GITHUB_PRIVATE_KEY) {
			appLogger.warn(
				'[GitHub Sync] Skipping sync: Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY.'
			);
			return;
		}

		try {
			appLogger.info(
				'[GitHub Sync] Starting synchronization with GitHub App installations...'
			);

			const octokit = new Octokit({
				authStrategy: createAppAuth,
				auth: {
					appId: ENV.GITHUB_APP_ID,
					privateKey: ENV.GITHUB_PRIVATE_KEY
				}
			});

			const remoteInstallations = await octokit.paginate(
				octokit.rest.apps.listInstallations,
				{ per_page: 100 }
			);

			const localInstallations =
				await githubAppInstallationsService.list();
			const remoteInstallationIds = new Set(
				remoteInstallations.map((i) => i.id)
			);

			// 1. Clean up local installations that no longer exist on GitHub
			for (const localInstallation of localInstallations) {
				if (
					!remoteInstallationIds.has(localInstallation.installationId)
				) {
					await githubAppInstallationsService.delete(
						localInstallation.id
					);
					appLogger.info(
						`[GitHub Sync] Removed stale local installation record for ID ${localInstallation.installationId}`
					);
				}
			}

			// 2. Process remote installations and their repositories
			for (const installation of remoteInstallations) {
				const installationId = installation.id;
				const account = installation.account as {
					login?: string;
					name?: string;
					type?: string;
				};
				const accountLogin =
					account?.login ?? account?.name ?? 'unknown';
				const accountType = account?.type ?? 'User';

				let record =
					await githubAppInstallationsService.getByInstallationId(
						installationId
					);
				if (!record) {
					record = await githubAppInstallationsService.create({
						installationId,
						accountLogin,
						accountType
					});
					appLogger.info(
						`[GitHub Sync] Created missing installation record for ID ${installationId}`
					);
				}

				// Scoped Octokit client for the specific installation
				const installationOctokit = new Octokit({
					authStrategy: createAppAuth,
					auth: {
						appId: ENV.GITHUB_APP_ID,
						privateKey: ENV.GITHUB_PRIVATE_KEY,
						installationId
					}
				});

				const remoteRepos = await installationOctokit.paginate(
					installationOctokit.rest.apps
						.listReposAccessibleToInstallation,
					{ per_page: 100 }
				);

				// Fetch all local repositories belonging to this installation
				const allLocalRepos = await githubRepositoriesService.list();
				const localReposForInstallation = allLocalRepos.filter(
					(r) => r.githubAppInstallationId === record.id
				);

				const remoteRepoUrls = new Set(
					remoteRepos.map(
						(repo) => `https://github.com/${repo.full_name}`
					)
				);

				// Clean up stale local repositories
				for (const localRepo of localReposForInstallation) {
					if (!remoteRepoUrls.has(localRepo.repositoryUrl)) {
						await githubRepositoriesService.delete(localRepo.id);
						appLogger.info(
							`[GitHub Sync] Removed stale repository record: ${localRepo.repositoryFullName}`
						);
					}
				}

				// Backfill missing repositories
				for (const repo of remoteRepos) {
					const repositoryUrl = `https://github.com/${repo.full_name}`;
					const exists = localReposForInstallation.some(
						(r) => r.repositoryUrl === repositoryUrl
					);

					if (!exists) {
						await githubRepositoriesService.create({
							githubAppInstallationId: record.id,
							repositoryUrl,
							repositoryFullName: repo.full_name
						});
						appLogger.info(
							`[GitHub Sync] Backfilled repository: ${repo.full_name}`
						);
					}
				}
			}

			appLogger.info(
				'[GitHub Sync] Synchronization completed successfully.'
			);
		} catch (err) {
			appLogger.error(
				'[GitHub Sync] Failed to synchronize GitHub installations:',
				err
			);
		}
	}
}

export const gitHubSyncService = new GitHubSyncService();
