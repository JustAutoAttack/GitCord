import { AppError, ErrorCode, appLogger } from '@core';
import { botCommandsRepo } from '@database';
import type { BotCommand } from '@domain';
import { BaseService } from './base';

export class BotCommandsService extends BaseService<
	BotCommand.Model,
	BotCommand.CreateInput,
	BotCommand.UpdateInput,
	typeof botCommandsRepo
> {
	constructor() {
		super(botCommandsRepo, 'bot command');
	}

	async getByCommandName(
		commandName: string
	): Promise<BotCommand.Model | null> {
		appLogger.debug(`Fetching bot command by name: ${commandName}`);
		const result = botCommandsRepo.findByCommandName(commandName) ?? null;
		if (!result) {
			appLogger.debug(`No bot command found for name: ${commandName}`);
		}
		return result;
	}

	async create(input: BotCommand.CreateInput): Promise<BotCommand.Model> {
		const existing = await this.getByCommandName(input.commandName);
		if (existing) {
			throw new AppError(
				ErrorCode.CONFLICT,
				`Bot command [${input.commandName}] already exists`
			);
		}

		appLogger.info(`Creating new bot command: ${input.commandName}`);

		return super.create({
			commandName: input.commandName,
			description: input.description
		});
	}
}

export const botCommandsService = new BotCommandsService();
