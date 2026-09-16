import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

import { appLogger, ENV } from '@core';
import { githubAppInstallationsService } from './github-app-installations';
import { githubRepositoriesService } from './github-repositories';

export class GitHubSyncService {
	private createOctokitClient(installationId?: number) {
		return new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: ENV.GITHUB_APP_ID,
				privateKey: ENV.GITHUB_PRIVATE_KEY,
				...(installationId && { installationId })
			}
		});
	}

	private async cleanupStaleInstallations(
		remoteInstallations: Array<{ id: number }>
	) {
		const localInstallations = await githubAppInstallationsService.list();
		const remoteIds = new Set(remoteInstallations.map((i) => i.id));

		for (const local of localInstallations) {
			if (!remoteIds.has(local.installationId)) {
				await githubAppInstallationsService.delete(local.id);
				appLogger.info(
					`[GitHub Sync] Removed stale local installation record for ID ${local.installationId}`
				);
			}
		}
	}

	private async getOrCreateInstallationRecord(installation: any) {
		const installationId = installation.id;
		const account = installation.account as {
			login?: string;
			name?: string;
			type?: string;
		};
		const accountLogin = account?.login ?? account?.name ?? 'unknown';
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
		return record;
	}

	private async syncRepositoriesForInstallation(
		recordId: string,
		installationId: number
	) {
		const installationOctokit = this.createOctokitClient(installationId);
		const remoteRepos = await installationOctokit.paginate(
			installationOctokit.rest.apps.listReposAccessibleToInstallation,
			{ per_page: 100 }
		);

		const allLocalRepos = await githubRepositoriesService.list();
		const localRepos = allLocalRepos.filter(
			(r) => r.githubAppInstallationId === recordId
		);
		const remoteRepoUrls = new Set(
			remoteRepos.map((repo) => `https://github.com/${repo.full_name}`)
		);

		// Cleanup stale repositories
		for (const localRepo of localRepos) {
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
			const exists = localRepos.some(
				(r) => r.repositoryUrl === repositoryUrl
			);

			if (!exists) {
				await githubRepositoriesService.create({
					githubAppInstallationId: recordId,
					repositoryUrl,
					repositoryFullName: repo.full_name
				});
				appLogger.info(
					`[GitHub Sync] Backfilled repository: ${repo.full_name}`
				);
			}
		}
	}

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
			const octokit = this.createOctokitClient();

			const remoteInstallations = await octokit.paginate(
				octokit.rest.apps.listInstallations,
				{ per_page: 100 }
			);

			await this.cleanupStaleInstallations(remoteInstallations);

			for (const installation of remoteInstallations) {
				const record =
					await this.getOrCreateInstallationRecord(installation);
				await this.syncRepositoriesForInstallation(
					record.id,
					installation.id
				);
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
