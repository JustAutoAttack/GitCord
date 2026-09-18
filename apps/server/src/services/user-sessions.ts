import {
	AppError,
	ErrorCode,
	appLogger,
	asyncLocalStorageService
} from '@core';
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

	async getCurrentUserSession(): Promise<UserSession.Model> {
		const userId = asyncLocalStorageService.getUserId();

		if (!userId) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Authenticated user not found'
			);
		}

		appLogger.debug(`Fetching current user session for user ID: ${userId}`);

		const session = await this.getByUserId(userId);

		if (!session) {
			throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
		}

		return session;
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
			const isRevoked = existingSession.revokedAt !== null;
			const isExpired =
				new Date(existingSession.expiresAt).getTime() <= Date.now();

			if (!isRevoked && !isExpired) {
				throw new AppError(
					ErrorCode.CONFLICT,
					`Active session for user [${input.userId}] already exists`
				);
			}

			appLogger.debug(
				`Replacing stale user session for user ID: ${input.userId}`
			);

			await this.delete(existingSession.id);
		}

		appLogger.info(
			`Creating new user session for user ID: ${input.userId}`
		);

		return super.create({
			userId: input.userId,
			accessToken: input.accessToken,
			refreshTokenHash: input.refreshTokenHash,
			expiresAt: input.expiresAt,
			revokedAt: input.revokedAt ?? null
		});
	}

	async revokeCurrentUserSession(): Promise<void> {
		const userId = asyncLocalStorageService.getUserId();

		if (!userId) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Authenticated user not found'
			);
		}

		const session = await this.getByUserId(userId);

		if (!session) {
			throw new AppError(ErrorCode.NOT_FOUND, 'User session not found');
		}

		if (session.revokedAt !== null) {
			return;
		}

		appLogger.info(`Revoking current user session for user ID: ${userId}`);

		await this.update(session.id, {
			revokedAt: new Date().toISOString()
		});
	}
}

export const userSessionsService = new UserSessionsService();
