import { AsyncLocalStorage } from 'async_hooks';

import { AppError, ErrorCode } from '../errors';

export interface RequestContextData {
	readonly serverRequestId: string;
	readonly clientRequestId?: string;
	readonly userId?: string;
	readonly roles: readonly string[];
}

class AsyncLocalStorageService {
	private readonly storage = new AsyncLocalStorage<RequestContextData>();

	public run<T>(context: RequestContextData, callback: () => T): T {
		return this.storage.run(context, callback);
	}

	public getStore(): RequestContextData | undefined {
		return this.storage.getStore();
	}

	public getServerRequestId(): string {
		const store = this.getStore();
		if (!store || !store.serverRequestId) {
			throw new AppError(
				ErrorCode.INTERNAL_ERROR,
				'Request context missing server request ID.'
			);
		}
		return store.serverRequestId;
	}

	public getClientRequestId(): string | null {
		const store = this.getStore();
		return store?.clientRequestId ?? null;
	}

	public getUserId(): string | null {
		const store = this.getStore();
		return store?.userId ?? null;
	}

	public getRoles(): readonly string[] {
		const store = this.getStore();
		if (!store || !store.roles) {
			return [];
		}
		return store.roles;
	}
}

export const asyncLocalStorageService = new AsyncLocalStorageService();
