// API Response Wrappers
export interface ApiResponse<T = unknown> {
	readonly success: boolean;
	readonly message?: string;
	readonly data?: T;
	readonly error?: string;
}

// JWT Structures
export interface JwtHeader {
	readonly alg: 'HS256';
	readonly typ: 'JWT';
}

export interface JwtMeta {
	readonly iat?: number;
	readonly exp?: number;
}

export interface JwtBody {
	readonly sub: string;
	readonly email?: string;
}

export type JwtPayload = JwtBody & JwtMeta;

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
