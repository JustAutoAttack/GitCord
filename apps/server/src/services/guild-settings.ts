import { AppError, ErrorCode, appLogger } from '@core';
import { guildSettingsRepo } from '@database';
import type {
	CreateGuildSettingInput,
	GuildSetting,
	UpdateGuildSettingInput
} from '@domain';

export class GuildSettingsService {
	async list(): Promise<GuildSetting[]> {
		appLogger.debug('Fetching all guild settings...');
		const results = await guildSettingsRepo.findAll();
		appLogger.debug(`Retrieved ${results.length} guild setting(s).`);
		return results;
	}

	async getById(id: string): Promise<GuildSetting | null> {
		appLogger.debug(`Fetching guild setting by ID: ${id}`);
		const result = (await guildSettingsRepo.findById(id)) ?? null;
		if (!result) {
			appLogger.warn(`Guild setting not found for ID: ${id}`);
		}
		return result;
	}

	async getByGuildId(guildId: string): Promise<GuildSetting | null> {
		appLogger.debug(`Fetching guild setting for guild ID: ${guildId}`);
		const result = guildSettingsRepo.findByGuildId(guildId) ?? null;
		if (!result) {
			appLogger.debug(`No guild setting found for guild ID: ${guildId}`);
		}
		return result;
	}

	async getBySystemChannelId(
		systemChannelId: string
	): Promise<GuildSetting | null> {
		appLogger.debug(
			`Fetching guild setting by system channel ID: ${systemChannelId}`
		);
		const result =
			guildSettingsRepo.findBySystemChannelId(systemChannelId) ?? null;
		if (!result) {
			appLogger.debug(
				`No guild setting found for system channel ID: ${systemChannelId}`
			);
		}
		return result;
	}

	async create(input: CreateGuildSettingInput): Promise<GuildSetting> {
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

		return await guildSettingsRepo.create({
			guildId: input.guildId,
			systemChannelId: input.systemChannelId
		});
	}

	async update(
		id: string,
		input: UpdateGuildSettingInput
	): Promise<GuildSetting> {
		appLogger.info(`Updating guild setting [ID: ${id}]`);

		const updated = await guildSettingsRepo.update(id, input);
		if (!updated) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`Guild setting [ID: ${id}] not found for update`
			);
		}

		appLogger.info(`Successfully updated guild setting [ID: ${id}]`);
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		appLogger.info(`Deleting guild setting [ID: ${id}]`);
		const deleted = await guildSettingsRepo.delete(id);

		if (!deleted) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`Guild setting [ID: ${id}] not found for deletion`
			);
		}

		appLogger.info(`Successfully deleted guild setting [ID: ${id}]`);
		return true;
	}
}

export const guildSettingsService = new GuildSettingsService();
