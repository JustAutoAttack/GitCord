import crypto from 'crypto';

import { appLogger } from '../loggers';

export class CryptoService {
	public generateId(): string {
		return crypto.randomUUID();
	}

	public generateToken(bytes: number = 32): string {
		return crypto.randomBytes(bytes).toString('hex');
	}

	public async hashString(inString: string): Promise<string> {
		const salt = crypto.randomBytes(16).toString('hex');
		return new Promise((resolve, reject) => {
			crypto.scrypt(
				inString,
				salt,
				64,
				(err: Error | null, derivedKey: Buffer) => {
					if (err) {
						appLogger.error(
							`CRITICAL: Failed to generate cryptographic string hash via scrypt. Error: ${err.message}`
						);
						reject(err);
					} else {
						resolve(`${salt}:${derivedKey.toString('hex')}`);
					}
				}
			);
		});
	}

	public async verifyHashedString(
		inString: string,
		hash: string
	): Promise<boolean> {
		const [salt, key] = hash.split(':');
		if (!salt || !key) {
			appLogger.warn(
				`SECURITY WARNING: Attempted to verify a hashed string with a malformed format (missing salt/key delimiter). Hash prefix: ${hash.substring(0, 5)}...`
			);
			return false;
		}

		return new Promise((resolve, reject) => {
			crypto.scrypt(
				inString,
				salt,
				64,
				(err: Error | null, derivedKey: Buffer) => {
					if (err) {
						appLogger.error(
							`CRITICAL: Failed to process scrypt execution during string verification. Error: ${err.message}`
						);
						reject(err);
					} else {
						try {
							const keyBuffer = Buffer.from(key, 'hex');
							const isValid = this.secureCompare(
								keyBuffer,
								derivedKey
							);
							if (!isValid) {
								appLogger.warn(
									'SECURITY NOTICE: String verification failed due to a cryptographic mismatch.'
								);
							}
							resolve(isValid);
						} catch (parseErr) {
							appLogger.error(
								`SECURITY ERROR: Failed to parse hex key buffer during string verification. Error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`
							);
							resolve(false);
						}
					}
				}
			);
		});
	}

	public createHmacSha256(secret: string, data: string): string {
		return crypto
			.createHmac('sha256', secret)
			.update(data)
			.digest('base64url');
	}

	public secureCompare(a: Buffer | string, b: Buffer | string): boolean {
		const bufA = Buffer.isBuffer(a) ? a : Buffer.from(a);
		const bufB = Buffer.isBuffer(b) ? b : Buffer.from(b);

		if (bufA.length !== bufB.length) {
			appLogger.warn(
				`SECURITY NOTICE: Buffer length mismatch in secureCompare (${bufA.length} vs ${bufB.length}). Possible tampering or incorrect input length.`
			);
			return false;
		}

		return crypto.timingSafeEqual(bufA, bufB);
	}
}

export const cryptoService = new CryptoService();
