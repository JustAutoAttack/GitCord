import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { GuildRepository } from '@domain';
import type { guildRepositories } from '../generated';

export type GuildRepositoryRow = InferSelectModel<typeof guildRepositories>;
export type GuildRepositoryInsert = InferInsertModel<typeof guildRepositories>;

export const guildRepositoryMapper = {
	toDomain(raw: GuildRepositoryRow): GuildRepository.Model {
		return {
			id: raw.id,
			guildId: raw.guildId,
			githubRepositoryId: raw.githubRepositoryId,
			commandChannelId: raw.commandChannelId,
			notificationChannelId: raw.notificationChannelId,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: GuildRepositoryRow | undefined | null
	): GuildRepository.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: GuildRepositoryRow[]): GuildRepository.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: GuildRepository.CreateInput): GuildRepositoryInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			guildId: input.guildId,
			githubRepositoryId: input.githubRepositoryId,
			commandChannelId: input.commandChannelId,
			notificationChannelId: input.notificationChannelId,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(
		input: GuildRepository.UpdateInput
	): Partial<GuildRepositoryInsert> {
		const update: Partial<GuildRepositoryInsert> = {};
		if (input.guildId !== undefined) update.guildId = input.guildId;
		if (input.githubRepositoryId !== undefined)
			update.githubRepositoryId = input.githubRepositoryId;
		if (input.commandChannelId !== undefined)
			update.commandChannelId = input.commandChannelId;
		if (input.notificationChannelId !== undefined)
			update.notificationChannelId = input.notificationChannelId;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
