import { describe, it, expect } from 'vitest';
import { guildSettingMapper } from '../../../../src/database/mappers/guild-setting';
import type { GuildSettingRow } from '../../../../src/database/mappers/guild-setting';

describe('guildSettingMapper', () => {
	const mockRow: GuildSettingRow = {
		id: 'test-id-123',
		guildId: 'guild-456',
		systemChannelId: 'channel-789',
		notifyOnConnection: '1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it(`should map database row to domain model correctly (handling '1' as true)`, () => {
		const domainModel = guildSettingMapper.toDomain(mockRow);

		expect(domainModel).toEqual({
			id: 'test-id-123',
			guildId: 'guild-456',
			systemChannelId: 'channel-789',
			notifyOnConnection: true,
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it(`should handle '0' string for notifyOnConnection as false`, () => {
		const rowFalse: GuildSettingRow = {
			...mockRow,
			notifyOnConnection: '0'
		};
		const domainModel = guildSettingMapper.toDomain(rowFalse);

		expect(domainModel.notifyOnConnection).toBe(false);
	});

	it('should handle toDomainOptional correctly', () => {
		expect(guildSettingMapper.toDomainOptional(null)).toBeUndefined();
		expect(guildSettingMapper.toDomainOptional(undefined)).toBeUndefined();
		expect(guildSettingMapper.toDomainOptional(mockRow)).toEqual(
			guildSettingMapper.toDomain(mockRow)
		);
	});

	it('should map a list of rows to domain models', () => {
		const rows = [
			mockRow,
			{ ...mockRow, id: 'test-id-999', notifyOnConnection: '0' }
		];
		const list = guildSettingMapper.toDomainList(rows);

		expect(list).toHaveLength(2);
		expect(list[0]?.notifyOnConnection).toBe(true);
		expect(list[1]?.notifyOnConnection).toBe(false);
	});

	it('should map create input to database insert shape with defaults', () => {
		// Test explicit false
		const insertPayload = guildSettingMapper.toInsert({
			guildId: 'new-guild',
			systemChannelId: 'new-channel',
			notifyOnConnection: false
		});

		expect(insertPayload.id).toBeDefined();
		expect(insertPayload.guildId).toBe('new-guild');
		expect(insertPayload.systemChannelId).toBe('new-channel');
		expect(insertPayload.notifyOnConnection).toBe('0');
		expect(insertPayload.createdAt).toBeDefined();
		expect(insertPayload.updatedAt).toBeDefined();

		// Test default fallback (undefined)
		const insertDefault = guildSettingMapper.toInsert({
			guildId: 'new-guild-2',
			systemChannelId: 'new-channel-2'
		});
		expect(insertDefault.notifyOnConnection).toBe('1');
	});

	it('should map update input to partial database insert shape covering all branches', () => {
		const updateGuild = guildSettingMapper.toUpdate({
			guildId: 'guild-updated'
		});
		expect(updateGuild.guildId).toBe('guild-updated');
		expect(updateGuild.updatedAt).toBeDefined();

		const updateSystem = guildSettingMapper.toUpdate({
			systemChannelId: 'channel-updated'
		});
		expect(updateSystem.systemChannelId).toBe('channel-updated');

		const updateTrue = guildSettingMapper.toUpdate({
			notifyOnConnection: true
		});
		expect(updateTrue.notifyOnConnection).toBe('1');

		const updateFalse = guildSettingMapper.toUpdate({
			notifyOnConnection: false
		});
		expect(updateFalse.notifyOnConnection).toBe('0');
	});
});
