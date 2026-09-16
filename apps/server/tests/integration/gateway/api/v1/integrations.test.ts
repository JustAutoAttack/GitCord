import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jwtService } from '@core';
import { integrationsService } from '@services';
import {
	githubAppInstallHandler,
	discordBotInstallHandler,
	discordBotInstallCallbackHandler
} from '@gateway/api/v1/integrations/handlers';

// Mock integrationsService
vi.mock('@services', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@services')>();
	return {
		...actual,
		integrationsService: {
			getGitHubInstallUrl: vi.fn(),
			getDiscordBotInstallUrl: vi.fn()
		}
	};
});

// Mock jwtService
vi.mock('@core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@core')>();
	return {
		...actual,
		jwtService: {
			...actual.jwtService,
			verify: vi.fn()
		},
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('Integration Handlers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('githubAppInstallHandler', () => {
		it('should generate GitHub install URL and redirect with 302', async () => {
			const mockUrl =
				'https://github.com/apps/test/installations/new?state=token';
			vi.mocked(integrationsService.getGitHubInstallUrl).mockReturnValue(
				mockUrl
			);

			const mockContext = {
				redirect: vi.fn().mockReturnValue('redirected')
			};

			await githubAppInstallHandler(mockContext as any, vi.fn());

			expect(
				integrationsService.getGitHubInstallUrl
			).toHaveBeenCalledTimes(1);
			expect(mockContext.redirect).toHaveBeenCalledWith(mockUrl, 302);
		});
	});

	describe('discordBotInstallHandler', () => {
		it('should generate Discord bot install URL and redirect with 302', async () => {
			const mockUrl =
				'https://discord.com/api/oauth2/authorize?client_id=123';
			vi.mocked(
				integrationsService.getDiscordBotInstallUrl
			).mockReturnValue(mockUrl);

			const mockContext = {
				redirect: vi.fn().mockReturnValue('redirected')
			};

			await discordBotInstallHandler(mockContext as any, vi.fn());

			expect(
				integrationsService.getDiscordBotInstallUrl
			).toHaveBeenCalledTimes(1);
			expect(mockContext.redirect).toHaveBeenCalledWith(mockUrl, 302);
		});
	});

	describe('discordBotInstallCallbackHandler', () => {
		it('should verify valid state and return success JSON response', async () => {
			const queryData = {
				guild_id: '123456789',
				permissions: '8',
				state: 'valid-state-token'
			};

			const mockContext = {
				req: {
					valid: vi.fn().mockReturnValue(queryData)
				},
				json: vi
					.fn()
					.mockImplementation((data, status) => ({ data, status }))
			};

			vi.mocked(jwtService.verify).mockReturnValue({
				sub: 'user-123',
				type: 'discord_bot_state'
			});

			const result = await discordBotInstallCallbackHandler(
				mockContext as any,
				vi.fn()
			);

			expect(mockContext.req.valid).toHaveBeenCalledWith('query');
			expect(jwtService.verify).toHaveBeenCalledWith('valid-state-token');
			expect(mockContext.json).toHaveBeenCalledWith(
				{
					success: true,
					message: 'Discord Bot added successfully',
					data: { guildId: '123456789', permissions: '8' }
				},
				200
			);
			expect(result).toEqual({
				data: {
					success: true,
					message: 'Discord Bot added successfully',
					data: { guildId: '123456789', permissions: '8' }
				},
				status: 200
			});
		});

		it('should handle missing state parameter gracefully without verifying', async () => {
			const queryData = {
				guild_id: '123456789',
				permissions: '8'
			};

			const mockContext = {
				req: {
					valid: vi.fn().mockReturnValue(queryData)
				},
				json: vi
					.fn()
					.mockImplementation((data, status) => ({ data, status }))
			};

			await discordBotInstallCallbackHandler(mockContext as any, vi.fn());

			expect(mockContext.req.valid).toHaveBeenCalledWith('query');
			expect(jwtService.verify).not.toHaveBeenCalled();
			expect(mockContext.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true }),
				200
			);
		});

		it('should handle invalid or unverified state token gracefully', async () => {
			const queryData = {
				guild_id: '123456789',
				permissions: '8',
				state: 'invalid-state-token'
			};

			const mockContext = {
				req: {
					valid: vi.fn().mockReturnValue(queryData)
				},
				json: vi
					.fn()
					.mockImplementation((data, status) => ({ data, status }))
			};

			vi.mocked(jwtService.verify).mockReturnValue(null);

			await discordBotInstallCallbackHandler(mockContext as any, vi.fn());

			expect(mockContext.req.valid).toHaveBeenCalledWith('query');
			expect(jwtService.verify).toHaveBeenCalledWith(
				'invalid-state-token'
			);
			expect(mockContext.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true }),
				200
			);
		});
	});
});
