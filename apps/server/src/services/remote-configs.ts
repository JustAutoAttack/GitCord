import { AppError, ErrorCode, appLogger } from '@core';
import { remoteConfigsRepo } from '@database';
import type { RemoteConfig } from '@domain';
import { BaseService } from './base';

export class RemoteConfigsService extends BaseService<
	RemoteConfig.Model,
	RemoteConfig.CreateInput,
	RemoteConfig.UpdateInput,
	typeof remoteConfigsRepo
> {
	constructor() {
		super(remoteConfigsRepo, 'remote configuration');
	}

	async list(guildId?: string): Promise<RemoteConfig.Model[]> {
		if (guildId) {
			appLogger.debug(
				`Fetching remote configurations for guild ID: ${guildId}`
			);
			return remoteConfigsRepo.findByGuildId(guildId);
		}
		return super.list();
	}

	async getByCommandChannelId(
		commandChannelId: string
	): Promise<RemoteConfig.Model | null> {
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
	): Promise<RemoteConfig.Model | null> {
		appLogger.debug(
			`Fetching remote configuration for guild: ${guildId}, repo: ${repositoryUrl}`
		);
		const result =
			remoteConfigsRepo.findByGuildAndRepo(guildId, repositoryUrl) ??
			null;
		return result;
	}

	async create(input: RemoteConfig.CreateInput): Promise<RemoteConfig.Model> {
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

		return super.create({
			guildId: input.guildId,
			repositoryUrl: input.repositoryUrl,
			commandChannelId: input.commandChannelId,
			notificationChannelId: input.notificationChannelId
		});
	}
}

export const remoteConfigsService = new RemoteConfigsService();
