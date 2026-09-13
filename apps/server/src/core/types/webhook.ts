import { TableAction, TableName } from './common';

export interface BasePayload<TData = Record<string, unknown>> {
	readonly timestamp: number;
	readonly data: TData;
}

export interface ServerLifecycleData {
	readonly status: 'ONLINE' | 'OFFLINE' | 'STARTING' | 'SHUTTING_DOWN';
	readonly reason?: string;
}

export interface TableUpdateData<TRecord = Record<string, unknown>> {
	readonly tableName: TableName;
	readonly action: TableAction;
	readonly recordId: string | number;
	readonly record?: TRecord | null;
}

export interface GithubEventData {
	readonly eventName: string;
	readonly payload: Record<string, unknown>;
}

export type ServerLifecyclePayload = BasePayload<ServerLifecycleData>;
export type TableUpdatePayload = BasePayload<TableUpdateData>;
export type GithubEventPayload = BasePayload<GithubEventData>;

export type WebhookPayload =
	| ServerLifecyclePayload
	| TableUpdatePayload
	| GithubEventPayload;
