import crypto from 'crypto';

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
					if (err) reject(err);
					else resolve(`${salt}:${derivedKey.toString('hex')}`);
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
			return false;
		}

		return new Promise((resolve, reject) => {
			crypto.scrypt(
				inString,
				salt,
				64,
				(err: Error | null, derivedKey: Buffer) => {
					if (err) reject(err);
					else {
						try {
							const keyBuffer = Buffer.from(key, 'hex');
							resolve(this.secureCompare(keyBuffer, derivedKey));
						} catch {
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
			return false;
		}

		return crypto.timingSafeEqual(bufA, bufB);
	}
}

export const cryptoService = new CryptoService();
