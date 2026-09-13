import { AppError, ErrorCode, ENV, appLogger, webhookDispatcher } from '@core';
import type { TableName, TableUpdatePayload } from '@core';

export interface BaseRepo<TSelect, TInsert, TId = string> {
	findAll(): Promise<TSelect[]> | TSelect[];
	findById(
		id: TId
	): Promise<TSelect | null | undefined> | TSelect | null | undefined;
	create(data: TInsert): Promise<TSelect> | TSelect;
	update(
		id: TId,
		data: any
	): Promise<TSelect | null | undefined> | TSelect | null | undefined;
	delete(id: TId): Promise<any> | any;
}

export class BaseService<
	TSelect,
	TInsert,
	TUpdate,
	TRepo extends BaseRepo<TSelect, TInsert>
> {
	protected repo: TRepo;
	protected entityName: string;
	protected tableName?: TableName;

	constructor(repo: TRepo, entityName: string, tableName?: TableName) {
		this.repo = repo;
		this.entityName = entityName;
		this.tableName = tableName;
	}

	protected async dispatchTableUpdate(
		action: 'CREATE' | 'UPDATE' | 'DELETE',
		recordId: string | number,
		record?: any
	): Promise<void> {
		if (
			!this.tableName ||
			!ENV.BOT_WEBHOOK_URL ||
			!ENV.BOT_WEBHOOK_SECRET
		) {
			return;
		}

		const tableUpdateUrl = new URL(
			'/table-update',
			ENV.BOT_WEBHOOK_URL
		).toString();

		const payload: TableUpdatePayload = {
			timestamp: Date.now(),
			data: {
				tableName: this.tableName,
				action,
				recordId,
				record: record ?? null
			}
		};

		try {
			await webhookDispatcher.broadcast(
				tableUpdateUrl,
				ENV.BOT_WEBHOOK_SECRET,
				payload
			);
		} catch (err) {
			appLogger.warn(
				`Failed to dispatch table-update webhook for ${this.tableName}: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	}

	async list(): Promise<TSelect[]> {
		appLogger.debug(`Fetching all ${this.entityName}(s)...`);
		const results = await this.repo.findAll();
		appLogger.debug(
			`Retrieved ${results.length} ${this.entityName}(s) record(s).`
		);
		return results;
	}

	async getById(id: string): Promise<TSelect | null> {
		appLogger.debug(`Fetching ${this.entityName} by ID: ${id}`);
		const result = (await this.repo.findById(id)) ?? null;
		if (!result) {
			appLogger.warn(`${this.entityName} not found for ID: ${id}`);
		}
		return result;
	}

	async create(input: TInsert): Promise<TSelect> {
		appLogger.info(`Creating new ${this.entityName}...`);
		const created = await this.repo.create(input);
		const recordId = (created as any)?.id ?? 'unknown';
		await this.dispatchTableUpdate('CREATE', recordId, created);
		return created;
	}

	async update(id: string, input: TUpdate): Promise<TSelect> {
		appLogger.info(`Updating ${this.entityName} [ID: ${id}]`);

		const updated = await this.repo.update(id, input);
		if (!updated) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`${this.entityName} [ID: ${id}] not found for update`
			);
		}

		appLogger.info(`Successfully updated ${this.entityName} [ID: ${id}]`);
		await this.dispatchTableUpdate('UPDATE', id, updated);
		return updated;
	}

	async delete(id: string): Promise<boolean> {
		appLogger.info(`Deleting ${this.entityName} [ID: ${id}]`);
		const deleted = await this.repo.delete(id);

		if (!deleted) {
			throw new AppError(
				ErrorCode.NOT_FOUND,
				`${this.entityName} [ID: ${id}] not found for deletion`
			);
		}

		appLogger.info(`Successfully deleted ${this.entityName} [ID: ${id}]`);
		await this.dispatchTableUpdate('DELETE', id);
		return true;
	}
}
