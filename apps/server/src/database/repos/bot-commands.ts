import { eq } from 'drizzle-orm';

import type { BotCommand } from '@domain';
import { logger } from '../logger';
import { db } from '../client';
import { botCommands } from '../generated';
import { BaseRepo } from './base';
import { botCommandMapper } from '../mappers';

export class BotCommandsRepo extends BaseRepo<
	typeof botCommands,
	BotCommand.Model,
	BotCommand.CreateInput,
	BotCommand.UpdateInput
> {
	constructor(database: typeof db = db) {
		super(botCommands, botCommandMapper, database);
	}

	findByCommandName(commandName: string): BotCommand.Model | undefined {
		logger.debug(
			`Executing findByCommandName with commandName: ${commandName}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.commandName, commandName))
			.get();

		if (!result) {
			logger.debug(
				`No bot command found for command name: ${commandName}`
			);
			return undefined;
		}
		return botCommandMapper.toDomain(result);
	}
}

export const botCommandsRepo = new BotCommandsRepo();
