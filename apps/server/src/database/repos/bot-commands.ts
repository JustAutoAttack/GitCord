import { eq, type InferSelectModel } from 'drizzle-orm';

import { databaseLogger } from '@core';
import { db } from '../client';
import { botCommands } from '../generated';
import { BaseRepo } from './base';

export type BotCommandEntity = InferSelectModel<typeof botCommands>;

export class BotCommandsRepo extends BaseRepo<typeof botCommands> {
	constructor(database: typeof db = db) {
		super(botCommands, database);
	}

	findByCommandName(commandName: string): BotCommandEntity | undefined {
		databaseLogger.debug(
			`Executing findByCommandName with commandName: ${commandName}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.commandName, commandName))
			.get();

		if (!result) {
			databaseLogger.debug(
				`No bot command found for command name: ${commandName}`
			);
		}
		return result;
	}
}

export const botCommandsRepo = new BotCommandsRepo();
