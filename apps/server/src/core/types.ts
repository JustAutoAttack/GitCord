
// API Response Wrappers
export interface ApiResponse<T = unknown> {
	readonly success: boolean;
	readonly message?: string;
	readonly data?: T;
	readonly error?: string;
}

// Auth Context
export interface AuthContext {
	readonly userId: string;
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
