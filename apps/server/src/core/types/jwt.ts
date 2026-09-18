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
	readonly [key: string]: unknown;
}

export type JwtPayload = JwtBody & JwtMeta;
