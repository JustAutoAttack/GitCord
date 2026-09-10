import { AppError, ErrorCode, appLogger } from '@core';
import { remoteConfigsRepo } from '@database';
import type {
	CreateRemoteConfigInput,
	RemoteConfig,
	UpdateRemoteConfigInput
} from '@domain';

export class RemoteConfigsService {
	async list(guildId?: string): Promise<RemoteConfig[]> {
		if (guildId) {
			appLogger.debug(
				`Fetching remote configurations for guild ID: ${guildId}`
			);
			return remoteConfigsRepo.findByGuildId(guildId);
		}

		appLogger.debug('Fetching all remote configurations...');
		const results = await remoteConfigsRepo.findAll();
		appLogger.debug(`Retrieved ${results.length} remote configuration(s).`);
		return results;
	}

	async getById(id: string): Promise<RemoteConfig | null> {
		appLogger.debug(`Fetching remote configuration by ID: ${id}`);
		const result = (await remoteConfigsRepo.findById(id)) ?? null;
		if (!result) {
			appLogger.warn(`Remote configuration not found for ID: ${id}`);
		}
		return result;
	}

	async getByCommandChannelId(
		commandChannelId: string
	): Promise<RemoteConfig | null> {
		appLogger.debug(
			`Fetching remote configuration by command channel ID: ${commandChannelId}`
		);
		const result =
			remoteConfigsRepo.findByCommandChannelId(commandChannelId) ?? null;
		if (!result) {
			appLogger.debug(
				`No remote configuration associated with command channel ID: ${commandChannelId}`
			);
		}
		return result;
	}

	async getByGuildAndRepo(
		guildId: string,
		repositoryUrl: string
	): Promise<RemoteConfig | null> {
		appLogger.debug(
			`Fetching remote configuration for guild: ${guildId}, repo: ${repositoryUrl}`
		);
		const result =
			remoteConfigsRepo.findByGuildAndRepo(guildId, repositoryUrl) ?? null;
		return result;
	}

	async create(input: CreateRemoteConfigInput): Promise<RemoteConfig> {
		const existingChannelConfig = await this.getByCommandChannelId(
			input.commandChannelId
		);
		if (existingChannelConfig) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Command channel [${input.commandChannelId}] is already bound to repository ${existingChannelConfig.repositoryUrl}`
			);
		}

		const existingGuildRemote = await this.getByGuildAndRepo(
			input.guildId,
			input.repositoryUrl
		);
		if (existingGuildRemote) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Guild [${input.guildId}] is already subscribed to repository ${input.repositoryUrl}`
			);
		}

		appLogger.info(
			`Creating new remote configuration for guild: ${input.guildId} (${input.repositoryUrl})`
		);

		return await remoteConfigsRepo.create({
			guildId: input.guildId,
			repositoryUrl: input.repositoryUrl,
			commandChannelId: input.commandChannelId,
			notificationChannelId: input.notificationChannelId
		});
	}

	async update(
		id: string,
		input: UpdateRemoteConfigInput
	): Promise<RemoteConfig> {
		appLogger.info(`Updating remote configuration [ID: ${id}]`);

		const updated = await remoteConfigsRepo.update(id, input);
		if (!updated) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`Remote configuration [ID: ${id}] not found for update`
			);
		}

		appLogger.info(
			`Successfully updated remote configuration [ID: ${id}]`
		);
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		appLogger.info(`Deleting remote configuration [ID: ${id}]`);
		const deleted = await remoteConfigsRepo.delete(id);

		if (!deleted) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`Remote configuration [ID: ${id}] not found for deletion`
			);
		}

		appLogger.info(`Successfully deleted remote configuration [ID: ${id}]`);
		return true;
	}
}

export const remoteConfigsService = new RemoteConfigsService();
