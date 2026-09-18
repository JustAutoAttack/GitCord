import { eq, getTableName, type InferSelectModel } from 'drizzle-orm';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { logger } from '../logger';
import { db } from '../client';

export interface EntityMapper<TModel, TRow> {
	toDomain(raw: TRow): TModel;
	toDomainOptional(raw: TRow | undefined | null): TModel | undefined;
	toDomainList(raws: TRow[]): TModel[];
	toInsert(input: any): any;
	toUpdate?(input: any): any;
}

export class BaseRepo<
	TTable extends SQLiteTable & { id: any },
	TModel = InferSelectModel<TTable>,
	TCreateInput = any,
	TUpdateInput = any
> {
	protected db: typeof db;
	protected table: TTable;
	protected tableName: string;
	protected mapper?: EntityMapper<TModel, InferSelectModel<TTable>>;

	constructor(
		table: TTable,
		mapper?: EntityMapper<TModel, InferSelectModel<TTable>>,
		database: typeof db = db
	) {
		this.table = table;
		this.db = database;
		this.tableName = getTableName(table);
		this.mapper = mapper;
	}

	findAll(): TModel[] {
		logger.debug(`Executing findAll on table: ${this.tableName}`);
		const results = this.db
			.select()
			.from(this.table)
			.all() as InferSelectModel<TTable>[];
		logger.debug(
			`Retrieved ${results.length} record(s) from ${this.tableName}`
		);
		return this.mapper
			? this.mapper.toDomainList(results)
			: (results as unknown as TModel[]);
	}

	findById(id: any): TModel | undefined {
		logger.debug(
			`Executing findById on table: ${this.tableName} with id: ${id}`
		);
		const result = this.db
			.select()
			.from(this.table)
			.where(eq(this.table.id, id))
			.get() as InferSelectModel<TTable> | undefined;

		if (!result) {
			logger.debug(`Record with id ${id} not found in ${this.tableName}`);
			return undefined;
		}
		return this.mapper
			? this.mapper.toDomain(result)
			: (result as unknown as TModel);
	}

	create(data: TCreateInput): TModel {
		logger.debug(`Executing create on table: ${this.tableName}`);
		const payload = this.mapper
			? this.mapper.toInsert(data)
			: {
					id: crypto.randomUUID(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					...data
				};

		try {
			const result = this.db
				.insert(this.table)
				.values(payload)
				.returning()
				.get() as InferSelectModel<TTable>;
			logger.debug(`Successfully created record in ${this.tableName}`);
			return this.mapper
				? this.mapper.toDomain(result)
				: (result as unknown as TModel);
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to create record in ${this.tableName}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	update(id: any, data: TUpdateInput): TModel | undefined {
		logger.debug(
			`Executing update on table: ${this.tableName} for id: ${id}`
		);

		const payload = this.mapper
			? this.mapper.toUpdate
				? this.mapper.toUpdate(data)
				: data
			: {
					...data,
					updatedAt: new Date().toISOString()
				};

		try {
			const result = this.db
				.update(this.table)
				.set(payload)
				.where(eq(this.table.id, id))
				.returning()
				.get() as InferSelectModel<TTable> | undefined;

			if (!result) {
				logger.warn(
					`Update attempted on non-existent record in ${this.tableName} with id: ${id}`
				);
				return undefined;
			}

			logger.debug(
				`Successfully updated record in ${this.tableName} with id: ${id}`
			);

			return this.mapper
				? this.mapper.toDomain(result)
				: (result as unknown as TModel);
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to update record in ${this.tableName} with id ${id}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}

	delete(id: any): TModel | undefined {
		logger.debug(
			`Executing delete on table: ${this.tableName} for id: ${id}`
		);
		const item = this.findById(id);

		if (!item) {
			logger.warn(
				`Delete attempted on non-existent record in ${this.tableName} with id: ${id}`
			);
			return undefined;
		}

		try {
			this.db.delete(this.table).where(eq(this.table.id, id)).run();
			logger.debug(
				`Successfully deleted record from ${this.tableName} with id: ${id}`
			);
			return item;
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to delete record from ${this.tableName} with id ${id}: ${error instanceof Error ? error.message : String(error)}`
			);
			throw error;
		}
	}
}
