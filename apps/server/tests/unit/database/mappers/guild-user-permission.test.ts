import { describe, it, expect } from 'vitest';
import { guildUserPermissionMapper } from '../../../../src/database/mappers/guild-user-permission';
import type { GuildUserPermissionRow } from '../../../../src/database/mappers/guild-user-permission';

describe('guildUserPermissionMapper', () => {
	const mockRow: GuildUserPermissionRow = {
		id: 'gup-id-1',
		guildId: 'guild-1',
		discordUserId: 'user-1',
		commandId: 'cmd-1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = guildUserPermissionMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'gup-id-1',
			guildId: 'guild-1',
			discordUserId: 'user-1',
			commandId: 'cmd-1',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(
			guildUserPermissionMapper.toDomainOptional(null)
		).toBeUndefined();
		expect(
			guildUserPermissionMapper.toDomainOptional(undefined)
		).toBeUndefined();
		expect(guildUserPermissionMapper.toDomainOptional(mockRow)).toEqual(
			guildUserPermissionMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = guildUserPermissionMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.discordUserId).toBe('user-1');
	});

	it('should map create input to insert payload', () => {
		const insert = guildUserPermissionMapper.toInsert({
			guildId: 'guild-1',
			discordUserId: 'user-1',
			commandId: 'cmd-1'
		});
		expect(insert.id).toBeDefined();
		expect(insert.guildId).toBe('guild-1');
		expect(insert.discordUserId).toBe('user-1');
		expect(insert.commandId).toBe('cmd-1');
		expect(insert.createdAt).toBeDefined();
		expect(insert.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload covering all branches', () => {
		const updateGuild = guildUserPermissionMapper.toUpdate({
			guildId: 'guild-2'
		});
		expect(updateGuild.guildId).toBe('guild-2');
		expect(updateGuild.updatedAt).toBeDefined();

		const updateUser = guildUserPermissionMapper.toUpdate({
			discordUserId: 'user-2'
		});
		expect(updateUser.discordUserId).toBe('user-2');

		const updateCmd = guildUserPermissionMapper.toUpdate({
			commandId: 'cmd-2'
		});
		expect(updateCmd.commandId).toBe('cmd-2');
	});
});
