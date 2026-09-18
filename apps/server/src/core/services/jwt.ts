import { ENV } from '../env';
import { appLogger } from '../loggers';
import type { JwtBody, JwtHeader, JwtMeta, JwtPayload } from '../types';

import { cryptoService } from './crypto';

export class JwtService {
	private readonly secret: string;

	private defaultExpirationSeconds = 900;

	constructor(secret?: string, defaultExpirationSeconds?: number) {
		this.secret = secret ?? ENV.JWT_SECRET;

		if (!this.secret) {
			throw new Error('JWT_SECRET is required for JWT operations.');
		}

		if (defaultExpirationSeconds !== undefined) {
			if (defaultExpirationSeconds <= 0) {
				throw new Error('JWT expiration must be greater than zero.');
			}

			this.defaultExpirationSeconds = defaultExpirationSeconds;
		}
	}

	public sign(payload: JwtBody, expiresInSeconds?: number): string {
		const expirationSeconds =
			expiresInSeconds ?? this.defaultExpirationSeconds;

		if (expirationSeconds <= 0) {
			throw new Error('JWT expiration must be greater than zero.');
		}

		const header: JwtHeader = {
			alg: 'HS256',
			typ: 'JWT'
		};

		const currentTime = Math.floor(Date.now() / 1000);
		const expiration = currentTime + expirationSeconds;

		const fullPayload: JwtPayload = {
			...payload,
			iat: currentTime,
			exp: expiration
		};

		const encodedHeader = this.base64UrlEncode(JSON.stringify(header));

		const encodedPayload = this.base64UrlEncode(
			JSON.stringify(fullPayload)
		);

		const signature = this.createSignature(encodedHeader, encodedPayload);

		return `${encodedHeader}.${encodedPayload}.${signature}`;
	}

	public verify(token: string): JwtPayload | null {
		try {
			const parts = token.split('.');

			if (parts.length !== 3) {
				appLogger.warn(
					`SECURITY WARNING: Failed to verify JWT. Malformed token structure (expected 3 parts, got ${parts.length}).`
				);

				return null;
			}

			const [encodedHeader, encodedPayload, signature] = parts as [
				string,
				string,
				string
			];

			const header = JSON.parse(
				this.base64UrlDecode(encodedHeader)
			) as JwtHeader;

			if (header.alg !== 'HS256' || header.typ !== 'JWT') {
				appLogger.warn(
					'SECURITY WARNING: Failed to verify JWT. Unsupported JWT header.'
				);

				return null;
			}

			const expectedSignature = this.createSignature(
				encodedHeader,
				encodedPayload
			);

			if (!cryptoService.secureCompare(signature, expectedSignature)) {
				appLogger.warn(
					'SECURITY ALERT: JWT signature verification failed. Possible token tampering or invalid secret.'
				);

				return null;
			}

			const payload = JSON.parse(
				this.base64UrlDecode(encodedPayload)
			) as JwtPayload;

			if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
				appLogger.warn(
					'SECURITY WARNING: Failed to verify JWT. Missing or invalid subject.'
				);

				return null;
			}

			if (typeof payload.exp !== 'number') {
				appLogger.warn(
					'SECURITY WARNING: Failed to verify JWT. Missing or invalid expiration.'
				);

				return null;
			}

			const currentTime = Math.floor(Date.now() / 1000);

			if (payload.exp <= currentTime) {
				appLogger.warn(
					`SECURITY NOTICE: JWT verification failed. Token has expired (exp: ${payload.exp}, current: ${currentTime}).`
				);

				return null;
			}

			return payload;
		} catch (err) {
			appLogger.error(
				`SECURITY ERROR: Exception encountered during JWT verification. Error: ${
					err instanceof Error ? err.message : String(err)
				}`
			);

			return null;
		}
	}

	private createSignature(
		encodedHeader: string,
		encodedPayload: string
	): string {
		return cryptoService.createHmacSha256(
			this.secret,
			`${encodedHeader}.${encodedPayload}`
		);
	}

	private base64UrlEncode(str: string): string {
		return Buffer.from(str, 'utf8').toString('base64url');
	}

	private base64UrlDecode(str: string): string {
		return Buffer.from(str, 'base64url').toString('utf8');
	}
}

export const jwtService = new JwtService();
