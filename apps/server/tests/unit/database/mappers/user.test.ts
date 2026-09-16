import { describe, it, expect } from 'vitest';
import { userMapper } from '../../../../src/database/mappers/user';
import type { UserRow } from '../../../../src/database/mappers/user';

describe('userMapper', () => {
	const mockRow: UserRow = {
		id: 'user-id-1',
		discordId: 'discord-123',
		displayName: 'TestUser',
		avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = userMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'user-id-1',
			discordId: 'discord-123',
			displayName: 'TestUser',
			avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(userMapper.toDomainOptional(null)).toBeUndefined();
		expect(userMapper.toDomainOptional(undefined)).toBeUndefined();
		expect(userMapper.toDomainOptional(mockRow)).toEqual(
			userMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = userMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.discordId).toBe('discord-123');
	});

	it('should map create input to insert payload handling avatarUrl defaults/nulls', () => {
		// Test with avatarUrl provided
		const insertWithAvatar = userMapper.toInsert({
			discordId: 'discord-123',
			displayName: 'TestUser',
			avatarUrl: 'https://cdn.discordapp.com/avatars/123/abc.png'
		});
		expect(insertWithAvatar.avatarUrl).toBe(
			'https://cdn.discordapp.com/avatars/123/abc.png'
		);

		// Test with avatarUrl omitted (tests the `avatarUrl ?? null` branch)
		const insertWithoutAvatar = userMapper.toInsert({
			discordId: 'discord-456',
			displayName: 'NoAvatarUser'
		});
		expect(insertWithoutAvatar.id).toBeDefined();
		expect(insertWithoutAvatar.discordId).toBe('discord-456');
		expect(insertWithoutAvatar.displayName).toBe('NoAvatarUser');
		expect(insertWithoutAvatar.avatarUrl).toBeNull();
		expect(insertWithoutAvatar.createdAt).toBeDefined();
		expect(insertWithoutAvatar.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload covering all branches', () => {
		const updateDiscord = userMapper.toUpdate({ discordId: 'discord-999' });
		expect(updateDiscord.discordId).toBe('discord-999');
		expect(updateDiscord.updatedAt).toBeDefined();

		const updateName = userMapper.toUpdate({ displayName: 'NewName' });
		expect(updateName.displayName).toBe('NewName');

		const updateAvatar = userMapper.toUpdate({ avatarUrl: null });
		expect(updateAvatar.avatarUrl).toBeNull();
	});
});
