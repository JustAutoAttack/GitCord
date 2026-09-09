import { eq } from 'drizzle-orm';
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
		// Extract SQLite table name if available via Drizzle symbol/property, fallback to generic
		this.tableName =
			(table as any)[Symbol.for('drizzle:Name')] ?? 'unknown_table';
	}

	async findAll(): Promise<TTable['$inferSelect'][]> {
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

	async findById(
		id: TTable['$inferSelect']['id']
	): Promise<TTable['$inferSelect'] | undefined> {
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

	async create(
		data: TTable['$inferInsert']
	): Promise<TTable['$inferSelect']> {
		databaseLogger.debug(`Executing create on table: ${this.tableName}`);
		try {
			const result = this.db
				.insert(this.table)
				.values(data as any)
				.returning()
				.get() as TTable['$inferSelect'];
			databaseLogger.debug(
				`Successfully created record in ${this.tableName}`
			);
			return result;
		} catch (error) {
			databaseLogger.error(
				`CRITICAL: Failed to create record in ${this.tableName}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	async update(
		id: TTable['$inferSelect']['id'],
		data: Partial<TTable['$inferInsert']>
	): Promise<TTable['$inferSelect'] | undefined> {
		databaseLogger.debug(
			`Executing update on table: ${this.tableName} for id: ${id}`
		);
		try {
			const result = this.db
				.update(this.table)
				.set(data as any)
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

	async delete(
		id: TTable['$inferSelect']['id']
	): Promise<TTable['$inferSelect'] | undefined> {
		databaseLogger.debug(
			`Executing delete on table: ${this.tableName} for id: ${id}`
		);
		const item = await this.findById(id);

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
