import { AppError, ErrorCode, appLogger } from '@core';

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

	constructor(repo: TRepo, entityName: string) {
		this.repo = repo;
		this.entityName = entityName;
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
		return await this.repo.create(input);
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
		return true;
	}
}
