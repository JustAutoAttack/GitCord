import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { BotCommand } from '@domain';
import type { botCommands } from '../generated';

export type BotCommandRow = InferSelectModel<typeof botCommands>;
export type BotCommandInsert = InferInsertModel<typeof botCommands>;

export const botCommandMapper = {
	toDomain(raw: BotCommandRow): BotCommand.Model {
		return {
			id: raw.id,
			commandName: raw.commandName,
			description: raw.description,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: BotCommandRow | undefined | null
	): BotCommand.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: BotCommandRow[]): BotCommand.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: BotCommand.CreateInput): BotCommandInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			commandName: input.commandName,
			description: input.description,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(input: BotCommand.UpdateInput): Partial<BotCommandInsert> {
		const update: Partial<BotCommandInsert> = {};
		if (input.commandName !== undefined)
			update.commandName = input.commandName;
		if (input.description !== undefined)
			update.description = input.description;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
