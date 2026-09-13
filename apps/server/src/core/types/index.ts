export * from './auth';
export * from './common';
export * from './jwt';
export * from './webhook';

// API Response Wrappers
export interface ApiResponse<T = unknown> {
	readonly success: boolean;
	readonly message?: string;
	readonly data?: T;
	readonly error?: string;
}

// Context
export interface RequestContextData {
	readonly serverRequestId: string;
	readonly clientRequestId?: string;
	readonly userAgent?: string;
	readonly ipAddress?: string;
	readonly timestamp: number;
	auth?: {
		userId: string;
		sessionId?: string;
		roles: readonly string[];
	};
}
