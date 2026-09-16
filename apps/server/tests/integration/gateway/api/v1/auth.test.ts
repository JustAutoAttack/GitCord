import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '@app';
import { authService } from '@services';
import { jwtService } from '@core';

vi.mock('@services/auth', () => ({
	authService: {
		getDiscordAuthUrl: vi.fn(() => 'https://discord.com/oauth/mock'),
		handleDiscordCallback: vi.fn(),
		signOut: vi.fn()
	}
}));

describe('Auth Gateway Endpoints', () => {
	let app: ReturnType<typeof createApp>;

	beforeEach(() => {
		app = createApp();
		vi.clearAllMocks();
	});

	it('GET /api/v1/auth/discord should redirect to OAuth provider', async () => {
		const res = await app.request('/api/v1/auth/discord');
		expect(res.status).toBe(302);
		expect(res.headers.get('Location')).toBe(
			'https://discord.com/oauth/mock'
		);
	});

	it('GET /api/v1/auth/discord/callback should validate query code and return user data', async () => {
		const mockUser = {
			id: 'usr_123',
			discordId: '123456',
			displayName: 'testuser',
			avatarUrl: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		vi.mocked(authService.handleDiscordCallback).mockResolvedValue(
			mockUser as any
		);

		const res = await app.request(
			'/api/v1/auth/discord/callback?code=test_auth_code'
		);
		expect(res.status).toBe(200);

		const json = (await res.json()) as {
			success: boolean;
			data: { user: { id: string } };
		};
		expect(json.success).toBe(true);
		expect(json.data.user.id).toBe('usr_123');
	});

	it('POST /api/v1/auth/sign-out should reject requests without a bearer token', async () => {
		const res = await app.request('/api/v1/auth/sign-out', {
			method: 'POST'
		});
		expect(res.status).toBe(401);
	});

	it('POST /api/v1/auth/sign-out should succeed with a valid Bearer token', async () => {
		const token = jwtService.sign({ sub: 'usr_123' });

		vi.mocked(authService.signOut).mockResolvedValue(undefined);

		const res = await app.request('/api/v1/auth/sign-out', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		expect(res.status).toBe(200);
		const json = (await res.json()) as {
			success: boolean;
			message?: string;
		};
		expect(json.success).toBe(true);
		expect(authService.signOut).toHaveBeenCalled();
	});
});
