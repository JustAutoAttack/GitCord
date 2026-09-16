import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService, usersService, userSessionsService } from '@services';
import { AppError, asyncLocalStorageService } from '@core';

vi.mock('../../../src/services/users', () => ({
	usersService: {
		getByDiscordId: vi.fn(),
		create: vi.fn()
	}
}));

vi.mock('../../../src/services/user-sessions', () => ({
	userSessionsService: {
		getByUserId: vi.fn(),
		create: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock('../../../src/core/services/async-storage', () => ({
	asyncLocalStorageService: {
		getServerRequestId: vi.fn(() => 'test-req-id'),
		getUserId: vi.fn()
	}
}));

describe('AuthService', () => {
	let authService: AuthService;
	const globalFetch = global.fetch;

	beforeEach(() => {
		authService = new AuthService();
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		global.fetch = globalFetch;
	});

	describe('getDiscordAuthUrl', () => {
		it('should generate a valid Discord OAuth URL', () => {
			const url = authService.getDiscordAuthUrl();
			expect(url).toContain('https://discord.com/api/oauth2/authorize');
			expect(url).toContain('response_type=code');
		});
	});

	describe('handleDiscordCallback', () => {
		it('should register a new user and create a session if neither exists', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						access_token: 'token_123',
						refresh_token: 'refresh_123',
						expires_in: 3600
					})
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: 'discord_999',
						username: 'newuser',
						avatar: 'avatar_hash'
					})
				} as Response);

			vi.mocked(usersService.getByDiscordId).mockResolvedValue(null);
			const createdUser = {
				id: 'usr_new',
				discordId: 'discord_999',
				displayName: 'newuser'
			};
			vi.mocked(usersService.create).mockResolvedValue(
				createdUser as any
			);
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue(null);

			const result =
				await authService.handleDiscordCallback('valid_code');

			expect(result).toEqual(createdUser);
			expect(usersService.create).toHaveBeenCalledWith(
				expect.objectContaining({
					discordId: 'discord_999',
					displayName: 'newuser'
				})
			);
			expect(userSessionsService.create).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'usr_new',
					accessTokenEncrypted: 'token_123'
				})
			);
		});

		it('should reuse existing user and session if already present', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						access_token: 'token_123',
						refresh_token: 'refresh_123',
						expires_in: 3600
					})
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: 'discord_999',
						username: 'existinguser',
						avatar: null
					})
				} as Response);

			const existingUser = {
				id: 'usr_existing',
				discordId: 'discord_999',
				displayName: 'existinguser'
			};
			vi.mocked(usersService.getByDiscordId).mockResolvedValue(
				existingUser as any
			);
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue({
				id: 'sess_1',
				userId: 'usr_existing'
			} as any);

			const result =
				await authService.handleDiscordCallback('valid_code');

			expect(result).toEqual(existingUser);
			expect(usersService.create).not.toHaveBeenCalled();
			expect(userSessionsService.create).not.toHaveBeenCalled();
		});

		it('should throw UNAUTHORIZED if token exchange fails', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: false
			} as Response);

			await expect(
				authService.handleDiscordCallback('bad_code')
			).rejects.toThrow(AppError);
		});

		it('should throw UNAUTHORIZED if fetching user profile fails', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						access_token: 'token_123',
						refresh_token: 'refresh_123',
						expires_in: 3600
					})
				} as Response)
				.mockResolvedValueOnce({
					ok: false
				} as Response);

			await expect(
				authService.handleDiscordCallback('valid_code')
			).rejects.toThrow(AppError);
		});
	});

	describe('signOut', () => {
		it('should successfully delete session when user is authenticated', async () => {
			vi.mocked(asyncLocalStorageService.getUserId).mockReturnValue(
				'usr_123'
			);
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue({
				id: 'sess_123',
				userId: 'usr_123'
			} as any);

			await authService.signOut();

			expect(userSessionsService.delete).toHaveBeenCalledWith('sess_123');
		});

		it('should throw UNAUTHORIZED if user ID is missing from async context', async () => {
			vi.mocked(asyncLocalStorageService.getUserId).mockReturnValue(
				undefined as any
			);

			await expect(authService.signOut()).rejects.toThrow(AppError);
		});

		it('should throw NOT_FOUND if active session does not exist', async () => {
			vi.mocked(asyncLocalStorageService.getUserId).mockReturnValue(
				'usr_123'
			);
			vi.mocked(userSessionsService.getByUserId).mockResolvedValue(null);

			await expect(authService.signOut()).rejects.toThrow(AppError);
		});
	});
});
