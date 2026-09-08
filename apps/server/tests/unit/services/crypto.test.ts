import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { cryptoService } from '@core';

describe('CryptoService', () => {
	// --- UUID Generation ---
	it('generates a valid UUID string', () => {
		const id = cryptoService.generateId();
		expect(typeof id).toBe('string');
		expect(id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
	});

	// --- Token Generation ---
	it('generates a random hex token of specified or default length', () => {
		const defaultToken = cryptoService.generateToken();
		expect(typeof defaultToken).toBe('string');
		expect(defaultToken.length).toBe(64); // 32 bytes * 2 hex chars per byte

		const customToken = cryptoService.generateToken(16);
		expect(customToken.length).toBe(32); // 16 bytes * 2 hex chars per byte
	});

	// --- Hashing and Verification ---
	it('hashes strings and successfully verifies them', async () => {
		const plainText = 'super-secret-value';
		const hashed = await cryptoService.hashString(plainText);

		expect(typeof hashed).toBe('string');
		expect(hashed).toContain(':');

		const isValid = await cryptoService.verifyHashedString(
			plainText,
			hashed
		);
		expect(isValid).toBe(true);

		const isInvalid = await cryptoService.verifyHashedString(
			'wrong-value',
			hashed
		);
		expect(isInvalid).toBe(false);
	});

	// --- Malformed Hash Handling ---
	it('returns false when verifying a malformed hash format', async () => {
		const isValid = await cryptoService.verifyHashedString(
			'test',
			'malformedhash'
		);
		expect(isValid).toBe(false);
	});

	// --- Scrypt Generation Errors ---
	it('handles scrypt errors during hash generation gracefully', async () => {
		const scryptSpy = vi
			.spyOn(crypto, 'scrypt')
			.mockImplementationOnce(
				(password: any, salt: any, keylen: any, callback: any) => {
					callback(new Error('Scrypt failure'), Buffer.alloc(0));
				}
			);

		await expect(cryptoService.hashString('test')).rejects.toThrow(
			'Scrypt failure'
		);
		scryptSpy.mockRestore();
	});

	// --- Scrypt Verification Errors ---
	it('handles scrypt errors during hash verification gracefully', async () => {
		const scryptSpy = vi
			.spyOn(crypto, 'scrypt')
			.mockImplementationOnce(
				(password: any, salt: any, keylen: any, callback: any) => {
					callback(
						new Error('Verification scrypt failure'),
						Buffer.alloc(0)
					);
				}
			);

		await expect(
			cryptoService.verifyHashedString('test', 'somesalt:somekey')
		).rejects.toThrow('Verification scrypt failure');
		scryptSpy.mockRestore();
	});

	// --- Buffer Parsing Failures ---
	it('returns false if key buffer parsing fails during verification', async () => {
		const compareSpy = vi
			.spyOn(cryptoService, 'secureCompare')
			.mockImplementationOnce(() => {
				throw new Error('Buffer comparison failed');
			});

		const isValid = await cryptoService.verifyHashedString(
			'test',
			'salt:somekey'
		);
		expect(isValid).toBe(false);
		compareSpy.mockRestore();
	});

	// --- HMAC SHA-256 Signatures ---
	it('creates accurate HMAC SHA-256 signatures', () => {
		const secret = 'secret-key';
		const data = 'payload-data';
		const signature1 = cryptoService.createHmacSha256(secret, data);
		const signature2 = cryptoService.createHmacSha256(secret, data);

		expect(typeof signature1).toBe('string');
		expect(signature1.length).toBeGreaterThan(0);
		expect(signature1).toBe(signature2);

		const differentSignature = cryptoService.createHmacSha256(
			'other-secret',
			data
		);
		expect(differentSignature).not.toBe(signature1);
	});

	// --- Secure Comparison ---
	it('compares buffers and strings securely with timing safety', () => {
		const strA = 'test-string';
		const strB = 'test-string';
		const strC = 'different';

		expect(cryptoService.secureCompare(strA, strB)).toBe(true);
		expect(cryptoService.secureCompare(strA, strC)).toBe(false);
		expect(cryptoService.secureCompare(strA, 'short')).toBe(false);

		const bufA = Buffer.from(strA);
		const bufB = Buffer.from(strB);
		const bufC = Buffer.from(strC);

		expect(cryptoService.secureCompare(bufA, bufB)).toBe(true);
		expect(cryptoService.secureCompare(bufA, bufC)).toBe(false);
		expect(cryptoService.secureCompare(bufA, Buffer.from('short'))).toBe(
			false
		);
	});
});
