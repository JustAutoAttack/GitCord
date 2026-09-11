import { beforeEach, describe, expect, it, vi } from 'vitest';
import { botCommandsRepo } from '@database';
import { BotCommandsService } from '@services/bot-commands';

vi.mock('@database', () => ({
	botCommandsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByCommandName: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('BotCommandsService', () => {
	let service: BotCommandsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new BotCommandsService();
	});

	it('returns a list of bot commands', async () => {
		const mockCommands = [{ id: 'cmd_1' }, { id: 'cmd_2' }] as any;
		vi.mocked(botCommandsRepo.findAll).mockReturnValueOnce(mockCommands);

		const result = await service.list();
		expect(result).toEqual(mockCommands);
	});

	it('returns a bot command by name', async () => {
		const mockCommand = { id: 'cmd_1', commandName: 'ping' } as any;
		vi.mocked(botCommandsRepo.findByCommandName).mockReturnValueOnce(
			mockCommand
		);

		const result = await service.getByCommandName('ping');
		expect(result).toEqual(mockCommand);
		expect(botCommandsRepo.findByCommandName).toHaveBeenCalledWith('ping');
	});

	it('creates a bot command successfully', async () => {
		const input = { commandName: 'ping', description: 'Replies with pong' };
		const mockCreated = { id: 'cmd_1', ...input } as any;

		vi.mocked(botCommandsRepo.findByCommandName).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(botCommandsRepo.create).mockReturnValueOnce(mockCreated);

		const result = await service.create(input);
		expect(result).toEqual(mockCreated);
		expect(botCommandsRepo.create).toHaveBeenCalledWith(input);
	});

	it('throws conflict error when creating a bot command that already exists', async () => {
		const input = { commandName: 'ping', description: 'Replies with pong' };
		vi.mocked(botCommandsRepo.findByCommandName).mockReturnValueOnce({
			id: 'cmd_1'
		} as any);

		await expect(service.create(input)).rejects.toThrow(/already exists/);
	});
});
