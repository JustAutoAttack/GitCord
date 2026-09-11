import { AppError, ErrorCode, appLogger } from '@core';
import { userSessionsRepo } from '@database';
import type { UserSession } from '@domain';
import { BaseService } from './base';

export class UserSessionsService extends BaseService<
	UserSession.Model,
	UserSession.CreateInput,
	UserSession.UpdateInput,
	typeof userSessionsRepo
> {
	constructor() {
		super(userSessionsRepo, 'user session');
	}

	async getByUserId(userId: string): Promise<UserSession.Model | null> {
		appLogger.debug(`Fetching user session for user ID: ${userId}`);
		const result = userSessionsRepo.findByUserId(userId) ?? null;
		if (!result) {
			appLogger.debug(`No user session found for user ID: ${userId}`);
		}
		return result;
	}

	async create(input: UserSession.CreateInput): Promise<UserSession.Model> {
		const existingSession = await this.getByUserId(input.userId);
		if (existingSession) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Active session for user [${input.userId}] already exists`
			);
		}

		appLogger.info(
			`Creating new user session for user ID: ${input.userId}`
		);

		return super.create({
			userId: input.userId,
			accessTokenEncrypted: input.accessTokenEncrypted,
			refreshTokenEncrypted: input.refreshTokenEncrypted,
			expiresAt: input.expiresAt
		});
	}
}

export const userSessionsService = new UserSessionsService();
