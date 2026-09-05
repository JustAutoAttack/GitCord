import { eq } from 'drizzle-orm';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { db } from '../client';

export class BaseRepo<TTable extends SQLiteTable & { id: any }> {
	protected db: typeof db;
	protected table: TTable;

	constructor(table: TTable, database: typeof db = db) {
		this.table = table;
		this.db = database;
	}

	async findAll(): Promise<TTable['$inferSelect'][]> {
		return this.db
			.select()
			.from(this.table)
			.all() as TTable['$inferSelect'][];
	}

	async findById(
		id: TTable['$inferSelect']['id']
	): Promise<TTable['$inferSelect'] | undefined> {
		return this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.get() as TTable['$inferSelect'] | undefined;
	}

	async create(
		data: TTable['$inferInsert']
	): Promise<TTable['$inferSelect']> {
		return this.db
			.insert(this.table)
			.values(data as any)
			.returning()
			.get() as TTable['$inferSelect'];
	}

	async update(
		id: TTable['$inferSelect']['id'],
		data: Partial<TTable['$inferInsert']>
	): Promise<TTable['$inferSelect'] | undefined> {
		return this.db
			.update(this.table)
			.set(data as any)
			.where(eq(this.table.id, id))
			.returning()
			.get() as TTable['$inferSelect'] | undefined;
	}

	async delete(
		id: TTable['$inferSelect']['id']
	): Promise<TTable['$inferSelect'] | undefined> {
		const item = await this.findById(id);

		if (!item) {
			return undefined;
		}

		this.db.delete(this.table).where(eq(this.table.id, id)).run();

		return item;
	}
}
