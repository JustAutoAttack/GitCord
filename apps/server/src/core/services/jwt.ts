import { JwtBody, JwtHeader, JwtPayload } from '../types';
import { ENV } from '../env';
import { cryptoService } from './crypto';

export class JwtService {
	private readonly secret: string;
	private readonly defaultExpirationSeconds: number = 900; // 15 minutes

	constructor(secret?: string, defaultExpirationSeconds?: number) {
		this.secret = secret ?? ENV.JWT_SECRET;
		if (defaultExpirationSeconds !== undefined) {
			this.defaultExpirationSeconds = defaultExpirationSeconds;
		}
	}

	public sign(payload: JwtBody, expiresInSeconds?: number): string {
		const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
		const currentTime: number = Math.floor(Date.now() / 1000);
		const expiration: number =
			currentTime + (expiresInSeconds ?? this.defaultExpirationSeconds);

		const fullPayload: JwtPayload = {
			...payload,
			iat: currentTime,
			exp: expiration
		};

		const encodedHeader: string = this.base64UrlEncode(
			JSON.stringify(header)
		);
		const encodedPayload: string = this.base64UrlEncode(
			JSON.stringify(fullPayload)
		);
		const signature: string = this.createSignature(
			encodedHeader,
			encodedPayload
		);

		return `${encodedHeader}.${encodedPayload}.${signature}`;
	}

	public verify(token: string): JwtPayload | null {
		try {
			const parts: string[] = token.split('.');
			if (parts.length !== 3) {
				return null;
			}

			const [encodedHeader, encodedPayload, signature] = parts as [
				string,
				string,
				string
			];

			const expectedSignature: string = this.createSignature(
				encodedHeader,
				encodedPayload
			);
			if (!cryptoService.secureCompare(signature, expectedSignature)) {
				return null;
			}

			const payload: JwtPayload = JSON.parse(
				this.base64UrlDecode(encodedPayload)
			);

			if (
				payload.exp !== undefined &&
				payload.exp < Math.floor(Date.now() / 1000)
			) {
				return null;
			}

			return payload;
		} catch {
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
		return Buffer.from(str, 'utf-8').toString('base64url');
	}

	private base64UrlDecode(str: string): string {
		return Buffer.from(str, 'base64url').toString('utf-8');
	}
}

export const jwtService = new JwtService();
