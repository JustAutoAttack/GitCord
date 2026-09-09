import { appLogger } from '@core';
import { repoConfigsRepo } from '@database';
import type {
	CreateRepoConfigInput,
	RepoConfig,
	UpdateRepoConfigInput
} from '@domain';

export class RepoConfigsService {
	async list(): Promise<RepoConfig[]> {
		appLogger.debug('Fetching all repository configurations...');
		const results = await repoConfigsRepo.findAll();
		appLogger.debug(
			`Retrieved ${results.length} repository configuration(s).`
		);
		return results;
	}

	async getById(id: string): Promise<RepoConfig | null> {
		appLogger.debug(`Fetching repository configuration by ID: ${id}`);
		const result = (await repoConfigsRepo.findById(id)) ?? null;
		if (!result) {
			appLogger.warn(`Repository configuration not found for ID: ${id}`);
		}
		return result;
	}

	async getByCommandChannelId(
		commandChannelId: string
	): Promise<RepoConfig | null> {
		appLogger.debug(
			`Fetching repository configuration by command channel ID: ${commandChannelId}`
		);
		const result =
			(await repoConfigsRepo.findByCommandChannelId(commandChannelId)) ??
			null;
		if (!result) {
			appLogger.debug(
				`No repository configuration associated with command channel ID: ${commandChannelId}`
			);
		}
		return result;
	}

	async create(input: CreateRepoConfigInput): Promise<RepoConfig> {
		const id = `cfg_${crypto.randomUUID()}`;
		appLogger.info(
			`Creating new repository configuration [ID: ${id}] for guild: ${input.guildId} (${input.repositoryUrl})`
		);

		try {
			const created = await repoConfigsRepo.create({
				id,
				guildId: input.guildId,
				repositoryUrl: input.repositoryUrl,
				commandChannelId: input.commandChannelId,
				notificationChannelId: input.notificationChannelId
			});
			appLogger.info(
				`Successfully created repository configuration [ID: ${id}]`
			);
			return created;
		} catch (error) {
			appLogger.error(
				`CRITICAL: Failed to create repository configuration [ID: ${id}]: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	async update(
		id: string,
		input: UpdateRepoConfigInput
	): Promise<RepoConfig | null> {
		appLogger.info(`Updating repository configuration [ID: ${id}]`);

		try {
			const updated = (await repoConfigsRepo.update(id, input)) ?? null;
			if (!updated) {
				appLogger.warn(
					`Update failed: Repository configuration not found for ID: ${id}`
				);
			} else {
				appLogger.info(
					`Successfully updated repository configuration [ID: ${id}]`
				);
			}
			return updated;
		} catch (error) {
			appLogger.error(
				`CRITICAL: Failed to update repository configuration [ID: ${id}]: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	async delete(id: string): Promise<boolean> {
		appLogger.info(`Deleting repository configuration [ID: ${id}]`);
		const deleted = await repoConfigsRepo.delete(id);

		if (deleted === undefined) {
			appLogger.warn(
				`Delete failed: Repository configuration not found for ID: ${id}`
			);
			return false;
		}

		appLogger.info(
			`Successfully deleted repository configuration [ID: ${id}]`
		);
		return true;
	}
}

export const repoConfigsService = new RepoConfigsService();
