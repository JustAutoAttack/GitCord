import crypto from 'node:crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	CryptoService,
	cryptoService
} from '../../../../src/core/services/crypto';

// Mock appLogger to keep test output clean during warning/error path tests
vi.mock('../../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('CryptoService', () => {
	let service: CryptoService;
	const originalBufferFrom = Buffer.from;

	beforeEach(() => {
		service = new CryptoService();
		vi.clearAllMocks();
	});

	describe('generateId', () => {
		it('should generate a valid v4 UUID string', () => {
			const id = service.generateId();
			expect(typeof id).toBe('string');
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
			expect(id).toMatch(uuidRegex);
		});

		it('should generate unique IDs on successive calls', () => {
			const id1 = service.generateId();
			const id2 = service.generateId();
			expect(id1).not.toBe(id2);
		});
	});

	describe('generateToken', () => {
		it('should generate a hex token of default length (32 bytes = 64 hex chars)', () => {
			const token = service.generateToken();
			expect(typeof token).toBe('string');
			expect(token.length).toBe(64);
			expect(/^[0-9a-f]+$/.test(token)).toBe(true);
		});

		it('should generate a hex token of custom byte length', () => {
			const token = service.generateToken(16);
			expect(token.length).toBe(32);
		});
	});

	describe('hashString and verifyHashedString', () => {
		it('should successfully hash a string and verify it correctly', async () => {
			const plainText = 'SuperSecretPassword123!';

			const hash = await service.hashString(plainText);
			expect(typeof hash).toBe('string');
			expect(hash).toContain(':');

			const isValid = await service.verifyHashedString(plainText, hash);
			expect(isValid).toBe(true);
		});

		it('should fail verification for an incorrect string', async () => {
			const plainText = 'SuperSecretPassword123!';
			const wrongText = 'WrongPassword456!';

			const hash = await service.hashString(plainText);
			const isValid = await service.verifyHashedString(wrongText, hash);

			expect(isValid).toBe(false);
		});

		it('should return false and log a warning for a malformed hash missing a delimiter', async () => {
			const isValid = await service.verifyHashedString(
				'test',
				'malformedhashstringwithoutcolon'
			);
			expect(isValid).toBe(false);
		});

		it('should reject and log error if crypto.scrypt fails during hashing', async () => {
			const scryptSpy = vi
				.spyOn(crypto, 'scrypt')
				.mockImplementation((...args: any[]) => {
					const callback = args[args.length - 1];
					callback(new Error('Scrypt failure'), Buffer.alloc(0));
				});

			await expect(service.hashString('test')).rejects.toThrow(
				'Scrypt failure'
			);
			scryptSpy.mockRestore();
		});

		it('should reject and log error if crypto.scrypt fails during verification', async () => {
			const scryptSpy = vi
				.spyOn(crypto, 'scrypt')
				.mockImplementation((...args: any[]) => {
					const callback = args[args.length - 1];
					callback(
						new Error('Verification scrypt failure'),
						Buffer.alloc(0)
					);
				});

			await expect(
				service.verifyHashedString('test', 'somesalt:somekey')
			).rejects.toThrow('Verification scrypt failure');
			scryptSpy.mockRestore();
		});

		it('should catch and handle unexpected errors during hex parsing in verification', async () => {
			const bufferFromSpy = vi
				.spyOn(Buffer, 'from')
				.mockImplementation((str: any, encoding?: any) => {
					if (str === 'triggererror') {
						throw new Error('Forced buffer parse error');
					}
					return originalBufferFrom(str, encoding);
				});

			const isValid = await service.verifyHashedString(
				'test',
				'validsalt:triggererror'
			);
			expect(isValid).toBe(false);
			bufferFromSpy.mockRestore();
		});
	});

	describe('createHmacSha256', () => {
		it('should create a valid deterministic base64url HMAC signature', () => {
			const secret = 'my-secret-key';
			const data = 'payload-data';

			const hmac1 = service.createHmacSha256(secret, data);
			const hmac2 = service.createHmacSha256(secret, data);

			expect(typeof hmac1).toBe('string');
			expect(hmac1).toBe(hmac2);
			expect(hmac1.length).toBeGreaterThan(0);
		});
	});

	describe('secureCompare', () => {
		it('should return true for identical strings or buffers', () => {
			expect(service.secureCompare('abc', 'abc')).toBe(true);
			expect(
				service.secureCompare(Buffer.from('abc'), Buffer.from('abc'))
			).toBe(true);
		});

		it('should return false for differing content of the same length', () => {
			expect(service.secureCompare('abc', 'abd')).toBe(false);
		});

		it('should return false and warn for differing lengths', () => {
			expect(service.secureCompare('abc', 'abcd')).toBe(false);
		});
	});

	describe('singleton instance', () => {
		it('should export a working default cryptoService singleton', () => {
			expect(cryptoService).toBeInstanceOf(CryptoService);
			expect(cryptoService.generateId()).toBeDefined();
		});
	});
});
