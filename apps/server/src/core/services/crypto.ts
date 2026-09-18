import crypto from 'crypto';

import { ENV } from '../env';
import { appLogger } from '../loggers';

const AES_ALGORITHM = 'aes-256-gcm';
const AES_KEY_BYTES = 32;
const AES_IV_BYTES = 12;
const AES_AUTH_TAG_BYTES = 16;

export class CryptoService {
	private readonly encryptionKey: Buffer;

	constructor(encryptionKey?: string) {
		const secret = encryptionKey ?? ENV.CRYPTO_SECRET;

		if (!secret) {
			throw new Error(
				'CRYPTO_SECRET is required for cryptographic operations.'
			);
		}

		if (!/^[0-9a-fA-F]{64}$/.test(secret)) {
			throw new Error(
				'CRYPTO_SECRET must be a 32-byte hexadecimal value (64 hex characters).'
			);
		}

		this.encryptionKey = Buffer.from(secret, 'hex');

		if (this.encryptionKey.length !== AES_KEY_BYTES) {
			throw new Error('CRYPTO_SECRET must decode to exactly 32 bytes.');
		}
	}

	public generateId(): string {
		return crypto.randomUUID();
	}

	public generateToken(bytes: number = 32): string {
		return crypto.randomBytes(bytes).toString('hex');
	}

	public encryptString(value: string): string {
		try {
			const iv = crypto.randomBytes(AES_IV_BYTES);
			const cipher = crypto.createCipheriv(
				AES_ALGORITHM,
				this.encryptionKey,
				iv
			);

			const encrypted = Buffer.concat([
				cipher.update(value, 'utf8'),
				cipher.final()
			]);

			const authTag = cipher.getAuthTag();

			return [
				'v1',
				iv.toString('base64url'),
				authTag.toString('base64url'),
				encrypted.toString('base64url')
			].join(':');
		} catch (err) {
			appLogger.error(
				`CRITICAL: Failed to encrypt string. Error: ${
					err instanceof Error ? err.message : String(err)
				}`
			);
			throw err;
		}
	}

	public decryptString(value: string): string {
		try {
			const parts = value.split(':');

			if (parts.length !== 4) {
				throw new Error('Invalid encrypted value format.');
			}

			const [version, encodedIv, encodedAuthTag, encodedCiphertext] =
				parts as [string, string, string, string];

			if (version !== 'v1') {
				throw new Error(
					`Unsupported encrypted value version: ${version}`
				);
			}

			const iv = Buffer.from(encodedIv, 'base64url');
			const authTag = Buffer.from(encodedAuthTag, 'base64url');
			const ciphertext = Buffer.from(encodedCiphertext, 'base64url');

			if (iv.length !== AES_IV_BYTES) {
				throw new Error('Invalid encryption IV.');
			}

			if (authTag.length !== AES_AUTH_TAG_BYTES) {
				throw new Error('Invalid encryption authentication tag.');
			}

			const decipher = crypto.createDecipheriv(
				AES_ALGORITHM,
				this.encryptionKey,
				iv
			);

			decipher.setAuthTag(authTag);

			const decrypted = Buffer.concat([
				decipher.update(ciphertext),
				decipher.final()
			]);

			return decrypted.toString('utf8');
		} catch (err) {
			appLogger.error(
				`SECURITY ERROR: Failed to decrypt string. Error: ${
					err instanceof Error ? err.message : String(err)
				}`
			);

			throw new Error('Failed to decrypt protected data.');
		}
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
								`SECURITY ERROR: Failed to parse hex key buffer during string verification. Error: ${
									parseErr instanceof Error
										? parseErr.message
										: String(parseErr)
								}`
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
