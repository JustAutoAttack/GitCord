import { AppError, ErrorCode, appLogger } from '@core';
import { guildSettingsRepo } from '@database';
import type { GuildSetting } from '@domain';
import { BaseService } from './base';

export class GuildSettingsService extends BaseService<
	GuildSetting.Model,
	GuildSetting.CreateInput,
	GuildSetting.UpdateInput,
	typeof guildSettingsRepo
> {
	constructor() {
		super(guildSettingsRepo, 'guild setting', 'guild_settings');
	}

	async list(notifyOnConnection?: boolean): Promise<GuildSetting.Model[]> {
		if (notifyOnConnection !== undefined) {
			appLogger.debug(
				`Listing guild settings by notifyOnConnection: ${notifyOnConnection}`
			);
			return guildSettingsRepo.findByNotifyOnConnection(
				notifyOnConnection
			);
		}
		return super.list();
	}

	async getByGuildId(
		guildId: string
	): Promise<GuildSetting.Model | undefined> {
		appLogger.debug(`Fetching guild setting for guild ID: ${guildId}`);
		const result = guildSettingsRepo.findByGuildId(guildId);
		if (!result) {
			appLogger.debug(`No guild setting found for guild ID: ${guildId}`);
			return undefined;
		}
		return result;
	}

	async getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSetting.Model | undefined> {
		appLogger.debug(
			`Fetching guild setting by system channel ID: ${systemChannelId}`
		);
		const result = guildSettingsRepo.findBySystemChannelId(systemChannelId);
		if (!result) {
			appLogger.debug(
				`No guild setting found for system channel ID: ${systemChannelId}`
			);
			return undefined;
		}
		return result;
	}

	async create(input: GuildSetting.CreateInput): Promise<GuildSetting.Model> {
		const existingGuild = await this.getByGuildId(input.guildId);
		if (existingGuild) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Guild settings for guild [${input.guildId}] already exist`
			);
		}

		const existingSystemChannel = await this.getBySystemChannelId(
			input.systemChannelId
		);
		if (existingSystemChannel) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`System channel [${input.systemChannelId}] is already bound to guild ${existingSystemChannel.guildId}`
			);
		}

		appLogger.info(
			`Creating new guild settings for guild: ${input.guildId}`
		);

		return super.create(input);
	}
}

export const guildSettingsService = new GuildSettingsService();
