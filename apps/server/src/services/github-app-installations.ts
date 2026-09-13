import { AppError, ErrorCode, appLogger } from '@core';
import { githubAppInstallationsRepo } from '@database';
import type { GithubAppInstallation } from '@domain';
import { BaseService } from './base';

export class GithubAppInstallationsService extends BaseService<
	GithubAppInstallation.Model,
	GithubAppInstallation.CreateInput,
	GithubAppInstallation.UpdateInput,
	typeof githubAppInstallationsRepo
> {
	constructor() {
		super(githubAppInstallationsRepo, 'GitHub app installation');
	}

	async getByInstallationId(
		installationId: number
	): Promise<GithubAppInstallation.Model | null> {
		appLogger.debug(
			`Fetching GitHub app installation by installation ID: ${installationId}`
		);
		const result =
			githubAppInstallationsRepo.findByInstallationId(installationId) ??
			null;
		if (!result) {
			appLogger.debug(
				`No GitHub app installation associated with installation ID: ${installationId}`
			);
		}
		return result;
	}

	async create(
		input: GithubAppInstallation.CreateInput
	): Promise<GithubAppInstallation.Model> {
		const existing = await this.getByInstallationId(input.installationId);
		if (existing) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`GitHub app installation [${input.installationId}] already exists`
			);
		}

		appLogger.info(
			`Creating new GitHub app installation for account: ${input.accountLogin} (${input.installationId})`
		);

		return super.create({
			installationId: input.installationId,
			accountLogin: input.accountLogin,
			accountType: input.accountType
		});
	}
}

export const githubAppInstallationsService =
	new GithubAppInstallationsService();
