import { describe, it, expect } from 'vitest';
import { botCommandMapper } from '../../../../src/database/mappers/bot-command';
import type { BotCommandRow } from '../../../../src/database/mappers/bot-command';

describe('botCommandMapper', () => {
	const mockRow: BotCommandRow = {
		id: 'cmd-id-1',
		commandName: 'ping',
		description: 'Replies with pong',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = botCommandMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'cmd-id-1',
			commandName: 'ping',
			description: 'Replies with pong',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(botCommandMapper.toDomainOptional(null)).toBeUndefined();
		expect(botCommandMapper.toDomainOptional(undefined)).toBeUndefined();
		expect(botCommandMapper.toDomainOptional(mockRow)).toEqual(
			botCommandMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = botCommandMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.commandName).toBe('ping');
	});

	it('should map create input to insert payload', () => {
		const insert = botCommandMapper.toInsert({
			commandName: 'test',
			description: 'desc'
		});
		expect(insert.id).toBeDefined();
		expect(insert.commandName).toBe('test');
		expect(insert.description).toBe('desc');
	});

	it('should map update input to partial payload', () => {
		const update = botCommandMapper.toUpdate({ description: 'new desc' });
		expect(update.description).toBe('new desc');
		expect(update.commandName).toBeUndefined();
		expect(update.updatedAt).toBeDefined();
	});
});
