import { AppError, ErrorCode, appLogger } from '@core';
import { guildUserPermissionsRepo, botCommandsRepo } from '@database';
import type { GuildUserPermission } from '@domain';
import { BaseService } from './base';

export class GuildUserPermissionsService extends BaseService<
	GuildUserPermission.Model,
	GuildUserPermission.CreateInput,
	GuildUserPermission.UpdateInput,
	typeof guildUserPermissionsRepo
> {
	constructor() {
		super(guildUserPermissionsRepo, 'guild user permission');
	}

	async list(guildId?: string): Promise<GuildUserPermission.Model[]> {
		if (guildId) {
			appLogger.debug(`Fetching permissions for guild ID: ${guildId}`);
			return guildUserPermissionsRepo.findByGuildId(guildId);
		}
		return super.list();
	}

	async getByGuildAndUser(
		guildId: string,
		discordUserId: string
	): Promise<GuildUserPermission.Model[]> {
		appLogger.debug(
			`Fetching permissions for user ${discordUserId} in guild ${guildId}`
		);
		return guildUserPermissionsRepo.findByGuildAndUser(
			guildId,
			discordUserId
		);
	}

	async create(
		input: GuildUserPermission.CreateInput
	): Promise<GuildUserPermission.Model> {
		const command = botCommandsRepo.findById(input.commandId);
		if (!command) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`Bot command [ID: ${input.commandId}] not found in registry`
			);
		}

		const existing = guildUserPermissionsRepo.findByGuildUserAndCommand(
			input.guildId,
			input.discordUserId,
			input.commandId
		);
		if (existing) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Permission for user [${input.discordUserId}] on command [${input.commandId}] in guild [${input.guildId}] already exists`
			);
		}

		appLogger.info(
			`Granting command [${input.commandId}] to user ${input.discordUserId} in guild ${input.guildId}`
		);

		return super.create({
			guildId: input.guildId,
			discordUserId: input.discordUserId,
			commandId: input.commandId
		});
	}

	async update(
		id: string,
		input: GuildUserPermission.UpdateInput
	): Promise<GuildUserPermission.Model> {
		if (input.commandId) {
			const command = botCommandsRepo.findById(input.commandId);
			if (!command) {
				throw new AppError(
					ErrorCode.NOT_FOUND,
					`Bot command [ID: ${input.commandId}] not found in registry`
				);
			}
		}
		return super.update(id, input);
	}
}

export const guildUserPermissionsService = new GuildUserPermissionsService();
