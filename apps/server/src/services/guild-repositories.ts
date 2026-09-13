import { AppError, ErrorCode, appLogger } from '@core';
import { guildRepositoriesRepo } from '@database';
import type { GuildRepository } from '@domain';
import { BaseService } from './base';

export class GuildRepositoriesService extends BaseService<
	GuildRepository.Model,
	GuildRepository.CreateInput,
	GuildRepository.UpdateInput,
	typeof guildRepositoriesRepo
> {
	constructor() {
		super(guildRepositoriesRepo, 'guild repository');
	}

	async list(
		guildId?: string,
		githubRepositoryId?: string
	): Promise<GuildRepository.Model[]> {
		if (guildId) {
			appLogger.debug(
				`Fetching guild repositories for guild ID: ${guildId}`
			);
			return guildRepositoriesRepo.findByGuildId(guildId);
		}
		if (githubRepositoryId) {
			appLogger.debug(
				`Fetching guild repositories for GitHub repository ID: ${githubRepositoryId}`
			);
			return guildRepositoriesRepo.findByGithubRepositoryId(
				githubRepositoryId
			);
		}
		return super.list();
	}

	async getByCommandChannelId(
		commandChannelId: string
	): Promise<GuildRepository.Model | null> {
		appLogger.debug(
			`Fetching guild repository by command channel ID: ${commandChannelId}`
		);
		const result =
			guildRepositoriesRepo.findByCommandChannelId(commandChannelId) ??
			null;
		if (!result) {
			appLogger.debug(
				`No guild repository associated with command channel ID: ${commandChannelId}`
			);
		}
		return result;
	}

	async getByGuildAndGithubRepositoryId(
		guildId: string,
		githubRepositoryId: string
	): Promise<GuildRepository.Model | null> {
		appLogger.debug(
			`Fetching guild repository for guild: ${guildId}, githubRepositoryId: ${githubRepositoryId}`
		);
		const result =
			guildRepositoriesRepo.findByGuildAndGithubRepositoryId(
				guildId,
				githubRepositoryId
			) ?? null;
		return result;
	}

	async create(
		input: GuildRepository.CreateInput
	): Promise<GuildRepository.Model> {
		const existingChannelConfig = await this.getByCommandChannelId(
			input.commandChannelId
		);
		if (existingChannelConfig) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Command channel [${input.commandChannelId}] is already bound to a repository subscription.`
			);
		}

		const existingGuildRemote = await this.getByGuildAndGithubRepositoryId(
			input.guildId,
			input.githubRepositoryId
		);
		if (existingGuildRemote) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Guild [${input.guildId}] is already subscribed to this GitHub repository.`
			);
		}

		appLogger.info(
			`Creating new guild repository subscription for guild: ${input.guildId} (GitHub repo ID: ${input.githubRepositoryId})`
		);

		return super.create({
			guildId: input.guildId,
			githubRepositoryId: input.githubRepositoryId,
			commandChannelId: input.commandChannelId,
			notificationChannelId: input.notificationChannelId
		});
	}
}

export const guildRepositoriesService = new GuildRepositoriesService();
