import { AppError, ErrorCode, appLogger } from '@core';
import { usersRepo } from '@database';
import type { User } from '@domain';
import { BaseService } from './base';

export class UsersService extends BaseService<
	User.Model,
	User.CreateInput,
	User.UpdateInput,
	typeof usersRepo
> {
	constructor() {
		super(usersRepo, 'user');
	}

	async getByDiscordId(discordId: string): Promise<User.Model | null> {
		appLogger.debug(`Fetching user by Discord ID: ${discordId}`);
		const result = usersRepo.findByDiscordId(discordId) ?? null;
		if (!result) {
			appLogger.debug(`No user found for Discord ID: ${discordId}`);
		}
		return result;
	}

	async create(input: User.CreateInput): Promise<User.Model> {
		const existingUser = await this.getByDiscordId(input.discordId);
		if (existingUser) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`User with Discord ID [${input.discordId}] already exists`
			);
		}

		appLogger.info(
			`Creating new user record for Discord ID: ${input.discordId}`
		);

		return super.create({
			discordId: input.discordId,
			displayName: input.displayName,
			avatarUrl: input.avatarUrl ?? null
		});
	}
}

export const usersService = new UsersService();
