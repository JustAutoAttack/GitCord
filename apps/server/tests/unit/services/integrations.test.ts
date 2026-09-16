import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.hoisted(() => {
	process.env.DATABASE_URL = 'file:test.db';
});

import { asyncLocalStorageService, jwtService, ENV } from '@core';
// Import directly from the file instead of the barrel file (@services)
import { IntegrationsService } from '../../../src/services/integrations';

vi.mock('@core', () => ({
	asyncLocalStorageService: {
		getUserId: vi.fn()
	},
	jwtService: {
		sign: vi.fn()
	},
	ENV: {
		GITHUB_APP_SLUG: 'test-github-app',
		DISCORD_CLIENT_ID: 'test-discord-client-id',
		BASE_URL: 'https://api.example.com'
	}
}));

describe('IntegrationsService', () => {
	let service: IntegrationsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new IntegrationsService();
	});

	describe('getGitHubInstallUrl', () => {
		it('should generate the correct GitHub installation URL', () => {
			vi.mocked(asyncLocalStorageService.getUserId).mockReturnValue(
				'user-123'
			);
			vi.mocked(jwtService.sign).mockReturnValue('mock-jwt-token');

			const url = service.getGitHubInstallUrl();

			expect(asyncLocalStorageService.getUserId).toHaveBeenCalledTimes(1);
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: 'user-123',
				type: 'github_install_state'
			});
			expect(url).toBe(
				'https://github.com/apps/test-github-app/installations/new?state=mock-jwt-token'
			);
		});
	});

	describe('getDiscordBotInstallUrl', () => {
		it('should generate the correct Discord bot installation URL', () => {
			vi.mocked(asyncLocalStorageService.getUserId).mockReturnValue(
				'user-456'
			);
			vi.mocked(jwtService.sign).mockReturnValue('mock-discord-jwt');

			const url = service.getDiscordBotInstallUrl();

			expect(asyncLocalStorageService.getUserId).toHaveBeenCalledTimes(1);
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: 'user-456',
				type: 'discord_bot_state'
			});

			const expectedRedirectUri = encodeURIComponent(
				'https://api.example.com/api/v1/integrations/discord/callback'
			);
			const expectedScopes = encodeURIComponent(
				'bot applications.commands'
			);

			expect(url).toBe(
				`https://discord.com/api/oauth2/authorize?client_id=test-discord-client-id&permissions=8&scope=${expectedScopes}&redirect_uri=${expectedRedirectUri}&response_type=code&state=mock-discord-jwt`
			);
		});
	});
});
