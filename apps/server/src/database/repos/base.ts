import { eq, getTableName } from 'drizzle-orm';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { databaseLogger } from '@core';
import { db } from '../client';

export class BaseRepo<TTable extends SQLiteTable & { id: any }> {
	protected db: typeof db;
	protected table: TTable;
	protected tableName: string;

	constructor(table: TTable, database: typeof db = db) {
		this.table = table;
		this.db = database;
		this.tableName = getTableName(table);
	}

	findAll(): TTable['$inferSelect'][] {
		databaseLogger.debug(`Executing findAll on table: ${this.tableName}`);
		const results = this.db
			.select()
			.from(this.table)
			.all() as TTable['$inferSelect'][];
		databaseLogger.debug(
			`Retrieved ${results.length} record(s) from ${this.tableName}`
		);
		return results;
	}

	findById(
		id: TTable['$inferSelect']['id']
	): TTable['$inferSelect'] | undefined {
		databaseLogger.debug(
			`Executing findById on table: ${this.tableName} with id: ${id}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.get() as TTable['$inferSelect'] | undefined;

		if (!result) {
			databaseLogger.debug(
				`Record with id ${id} not found in ${this.tableName}`
			);
		}
		return result;
	}

	create(
		data: Omit<TTable['$inferInsert'], 'id' | 'createdAt' | 'updatedAt'> & {
			createdAt?: string;
			updatedAt?: string;
		}
	): TTable['$inferSelect'] {
		databaseLogger.debug(`Executing create on table: ${this.tableName}`);
		const now = new Date().toISOString();
		const id = crypto.randomUUID();
		const payload = {
			id,
			createdAt: now,
			updatedAt: now,
			...data
		};

		try {
			const result = this.db
				.insert(this.table)
				.values(payload as any)
				.returning()
				.get() as TTable['$inferSelect'];
			databaseLogger.debug(
				`Successfully created record in ${this.tableName} with id: ${id}`
			);
			return result;
		} catch (error) {
			databaseLogger.error(
				`CRITICAL: Failed to create record in ${this.tableName}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	update(
		id: TTable['$inferSelect']['id'],
		data: Partial<
			Omit<TTable['$inferInsert'], 'createdAt' | 'updatedAt'>
		> & {
			updatedAt?: string;
		}
	): TTable['$inferSelect'] | undefined {
		databaseLogger.debug(
			`Executing update on table: ${this.tableName} for id: ${id}`
		);
		const payload = {
			...data,
			updatedAt: new Date().toISOString()
		};

		try {
			const result = this.db
				.update(this.table)
				.set(payload as any)
				.where(eq(this.table.id, id))
				.returning()
				.get() as TTable['$inferSelect'] | undefined;

			if (!result) {
				databaseLogger.warn(
					`Update attempted on non-existent record in ${this.tableName} with id: ${id}`
				);
			} else {
				databaseLogger.debug(
					`Successfully updated record in ${this.tableName} with id: ${id}`
				);
			}
			return result;
		} catch (error) {
			databaseLogger.error(
				`CRITICAL: Failed to update record in ${this.tableName} with id ${id}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	delete(
		id: TTable['$inferSelect']['id']
	): TTable['$inferSelect'] | undefined {
		databaseLogger.debug(
			`Executing delete on table: ${this.tableName} for id: ${id}`
		);
		const item = this.findById(id);

		if (!item) {
			databaseLogger.warn(
				`Delete attempted on non-existent record in ${this.tableName} with id: ${id}`
			);
			return undefined;
		}

		try {
			this.db.delete(this.table).where(eq(this.table.id, id)).run();
			databaseLogger.debug(
				`Successfully deleted record from ${this.tableName} with id: ${id}`
			);
			return item;
		} catch (error) {
			databaseLogger.error(
				`CRITICAL: Failed to delete record from ${this.tableName} with id ${id}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}
}
