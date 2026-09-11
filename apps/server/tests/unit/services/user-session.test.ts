import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userSessionsRepo } from '@database';
import { UserSessionsService } from '@services/user-sessions';

vi.mock('@database', () => ({
	userSessionsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByUserId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('UserSessionsService', () => {
	let service: UserSessionsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new UserSessionsService();
	});

	it('returns a session by user id', async () => {
		const mockSession = { id: 'sess_1', userId: 'user_1' } as any;
		vi.mocked(userSessionsRepo.findByUserId).mockReturnValueOnce(
			mockSession
		);

		const result = await service.getByUserId('user_1');
		expect(result).toEqual(mockSession);
	});

	it('creates a user session successfully', async () => {
		const input = {
			userId: 'user_1',
			accessTokenEncrypted: 'enc_acc',
			refreshTokenEncrypted: 'enc_ref',
			expiresAt: new Date().toISOString()
		};
		const mockCreated = { id: 'sess_1', ...input } as any;

		vi.mocked(userSessionsRepo.findByUserId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(userSessionsRepo.create).mockReturnValueOnce(mockCreated);

		const result = await service.create(input);
		expect(result).toEqual(mockCreated);
	});

	it('throws conflict error if an active session already exists for user', async () => {
		const input = {
			userId: 'user_1',
			accessTokenEncrypted: 'enc_acc',
			refreshTokenEncrypted: 'enc_ref',
			expiresAt: new Date().toISOString()
		};
		vi.mocked(userSessionsRepo.findByUserId).mockReturnValueOnce({
			id: 'sess_1'
		} as any);

		await expect(service.create(input)).rejects.toThrow(/already exists/);
	});
});
