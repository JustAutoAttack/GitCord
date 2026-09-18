import { AppError, ErrorCode, appLogger } from '@core';
import { discordSessionsRepo } from '@database';
import type { DiscordSession } from '@domain';
import { BaseService } from './base';

export class DiscordSessionsService extends BaseService<
	DiscordSession.Model,
	DiscordSession.CreateInput,
	DiscordSession.UpdateInput,
	typeof discordSessionsRepo
> {
	constructor() {
		super(discordSessionsRepo, 'discord session');
	}

	async getByUserId(userId: string): Promise<DiscordSession.Model | null> {
		appLogger.debug(`Fetching discord session for user ID: ${userId}`);

		const result = discordSessionsRepo.findByUserId(userId) ?? null;

		if (!result) {
			appLogger.debug(`No discord session found for user ID: ${userId}`);
		}

		return result;
	}

	async create(
		input: DiscordSession.CreateInput
	): Promise<DiscordSession.Model> {
		const existingSession = await this.getByUserId(input.userId);

		if (existingSession) {
			const isRevoked = existingSession.revokedAt !== null;
			const isExpired =
				new Date(existingSession.expiresAt).getTime() <= Date.now();

			if (!isRevoked && !isExpired) {
				throw new AppError(
					ErrorCode.CONFLICT,
					`Active discord session for user [${input.userId}] already exists`
				);
			}

			appLogger.debug(
				`Replacing stale discord session for user ID: ${input.userId}`
			);

			await this.delete(existingSession.id);
		}

		appLogger.info(
			`Creating new discord session for user ID: ${input.userId}`
		);

		return super.create({
			userId: input.userId,
			accessToken: input.accessToken,
			refreshToken: input.refreshToken,
			expiresAt: input.expiresAt,
			revokedAt: input.revokedAt ?? null
		});
	}

	async revoke(userId: string): Promise<void> {
		const session = await this.getByUserId(userId);

		if (!session || session.revokedAt !== null) {
			return;
		}

		appLogger.info(`Revoking discord session for user ID: ${userId}`);

		await this.update(session.id, {
			revokedAt: new Date().toISOString()
		});
	}
}

export const discordSessionsService = new DiscordSessionsService();
