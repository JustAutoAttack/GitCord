import { repoConfigsRepo } from '@database';

import type {
	CreateRepoConfigInput,
	RepoConfig,
	UpdateRepoConfigInput
} from '@domain';

export class RepoConfigsService {
	async list(): Promise<RepoConfig[]> {
		return repoConfigsRepo.findAll();
	}

	async getById(id: string): Promise<RepoConfig | null> {
		return (await repoConfigsRepo.findById(id)) ?? null;
	}

	async getByCommandChannelId(
		commandChannelId: string
	): Promise<RepoConfig | null> {
		return (
			(await repoConfigsRepo.findByCommandChannelId(commandChannelId)) ??
			null
		);
	}

	async create(input: CreateRepoConfigInput): Promise<RepoConfig> {
		return repoConfigsRepo.create({
			id: `cfg_${crypto.randomUUID()}`,
			guildId: input.guildId,
			commandChannelId: input.commandChannelId,
			notificationChannelId: input.notificationChannelId
		});
	}

	async update(
		id: string,
		input: UpdateRepoConfigInput
	): Promise<RepoConfig | null> {
		return (await repoConfigsRepo.update(id, input)) ?? null;
	}

	async delete(id: string): Promise<boolean> {
		const deleted = await repoConfigsRepo.delete(id);

		return deleted !== undefined;
	}
}

export const repoConfigsService = new RepoConfigsService();
