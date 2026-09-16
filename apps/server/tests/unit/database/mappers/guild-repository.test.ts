import { describe, it, expect } from 'vitest';
import { guildRepositoryMapper } from '../../../../src/database/mappers/guild-repository';
import type { GuildRepositoryRow } from '../../../../src/database/mappers/guild-repository';

describe('guildRepositoryMapper', () => {
	const mockRow: GuildRepositoryRow = {
		id: 'g-repo-1',
		guildId: 'guild-1',
		githubRepositoryId: 'repo-1',
		commandChannelId: 'chan-cmd-1',
		notificationChannelId: 'chan-notif-1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = guildRepositoryMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'g-repo-1',
			guildId: 'guild-1',
			githubRepositoryId: 'repo-1',
			commandChannelId: 'chan-cmd-1',
			notificationChannelId: 'chan-notif-1',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(guildRepositoryMapper.toDomainOptional(null)).toBeUndefined();
		expect(
			guildRepositoryMapper.toDomainOptional(undefined)
		).toBeUndefined();
		expect(guildRepositoryMapper.toDomainOptional(mockRow)).toEqual(
			guildRepositoryMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = guildRepositoryMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.guildId).toBe('guild-1');
	});

	it('should map create input to insert payload', () => {
		const insert = guildRepositoryMapper.toInsert({
			guildId: 'guild-1',
			githubRepositoryId: 'repo-1',
			commandChannelId: 'chan-cmd-1',
			notificationChannelId: 'chan-notif-1'
		});
		expect(insert.id).toBeDefined();
		expect(insert.guildId).toBe('guild-1');
		expect(insert.githubRepositoryId).toBe('repo-1');
		expect(insert.commandChannelId).toBe('chan-cmd-1');
		expect(insert.notificationChannelId).toBe('chan-notif-1');
		expect(insert.createdAt).toBeDefined();
		expect(insert.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload covering all fields', () => {
		const updateGuild = guildRepositoryMapper.toUpdate({
			guildId: 'guild-2'
		});
		expect(updateGuild.guildId).toBe('guild-2');
		expect(updateGuild.updatedAt).toBeDefined();

		const updateRepo = guildRepositoryMapper.toUpdate({
			githubRepositoryId: 'repo-2'
		});
		expect(updateRepo.githubRepositoryId).toBe('repo-2');

		const updateCmd = guildRepositoryMapper.toUpdate({
			commandChannelId: 'chan-cmd-2'
		});
		expect(updateCmd.commandChannelId).toBe('chan-cmd-2');

		const updateNotif = guildRepositoryMapper.toUpdate({
			notificationChannelId: 'chan-notif-2'
		});
		expect(updateNotif.notificationChannelId).toBe('chan-notif-2');
	});
});
