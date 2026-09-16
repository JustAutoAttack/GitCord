import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { guildSettings } from '../generated';
import type { GuildSetting } from '@domain';

export type GuildSettingRow = InferSelectModel<typeof guildSettings>;
export type GuildSettingInsert = InferInsertModel<typeof guildSettings>;

export const guildSettingMapper = {
	toDomain(raw: GuildSettingRow): GuildSetting.Model {
		return {
			id: raw.id,
			guildId: raw.guildId,
			systemChannelId: raw.systemChannelId,
			notifyOnConnection: raw.notifyOnConnection === '1',
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: GuildSettingRow | undefined | null
	): GuildSetting.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: GuildSettingRow[]): GuildSetting.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: GuildSetting.CreateInput): GuildSettingInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			guildId: input.guildId,
			systemChannelId: input.systemChannelId,
			notifyOnConnection: (input.notifyOnConnection ?? true) ? '1' : '0',
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: GuildSetting.UpdateInput): Partial<GuildSettingInsert> {
		const update: Partial<GuildSettingInsert> = {};
		if (input.guildId !== undefined) update.guildId = input.guildId;
		if (input.systemChannelId !== undefined)
			update.systemChannelId = input.systemChannelId;
		if (input.notifyOnConnection !== undefined) {
			update.notifyOnConnection = input.notifyOnConnection ? '1' : '0';
		}
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
