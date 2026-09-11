import { AsyncLocalStorage } from 'async_hooks';

import { AppError, ErrorCode } from '@core';
import type { RequestContextData } from '../types';

class AsyncLocalStorageService {
	private readonly storage = new AsyncLocalStorage<RequestContextData>();

	public run<T>(context: RequestContextData, callback: () => T): T {
		return this.storage.run(context, callback);
	}

	public getStore(): RequestContextData | undefined {
		return this.storage.getStore();
	}

	public updateStore(updater: (store: RequestContextData) => void): void {
		const store = this.getStore();
		if (store) {
			updater(store);
		}
	}

	public getServerRequestId(): string {
		const store = this.getStore();
		if (!store?.serverRequestId) {
			throw new AppError(
				ErrorCode.INTERNAL_ERROR,
				'Request context missing server request ID.'
			);
		}
		return store.serverRequestId;
	}

	public getUserId(): string | null {
		const store = this.getStore();
		return store?.auth?.userId ?? null;
	}

	public getRoles(): readonly string[] {
		const store = this.getStore();
		return store?.auth?.roles ?? [];
	}
}

export const asyncLocalStorageService = new AsyncLocalStorageService();
