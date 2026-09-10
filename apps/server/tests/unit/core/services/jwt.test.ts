import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JwtService } from '@core';

describe('JwtService', () => {
	const testSecret = 'test-jwt-secret-key-12345';
	let jwtService: JwtService;

	beforeEach(() => {
		jwtService = new JwtService(testSecret, 900);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// --- Token Signing and Verification ---
	it('signs and verifies a valid token with default expiration', () => {
		const payload = { sub: 'user_123', email: 'test@example.com' };
		const token = jwtService.sign(payload);

		expect(typeof token).toBe('string');
		expect(token.split('.').length).toBe(3);

		const decoded = jwtService.verify(token);
		expect(decoded).not.toBeNull();
		expect(decoded?.sub).toBe('user_123');
		expect(decoded?.email).toBe('test@example.com');
		expect(decoded?.iat).toBeDefined();
		expect(decoded?.exp).toBeDefined();
	});

	// --- Custom Expiration ---
	it('signs a token with custom expiration time', () => {
		const now = 1000000000;
		vi.useFakeTimers();
		vi.setSystemTime(now * 1000);

		const token = jwtService.sign({ sub: 'user_custom' }, 60);
		const decoded = jwtService.verify(token);

		expect(decoded?.exp).toBe(now + 60);
	});

	// --- Invalid Token Structure ---
	it('returns null when verifying a token with invalid parts count', () => {
		expect(jwtService.verify('invalidtoken')).toBeNull();
		expect(jwtService.verify('part1.part2')).toBeNull();
		expect(jwtService.verify('part1.part2.part3.part4')).toBeNull();
	});

	// --- Invalid Signature ---
	it('returns null when verifying a token with an invalid signature', () => {
		const token = jwtService.sign({ sub: 'user_123' });
		const [header, payload] = token.split('.');
		const tamperedToken = `${header}.${payload}.invalidsignature`;

		expect(jwtService.verify(tamperedToken)).toBeNull();
	});

	// --- Expired Token ---
	it('returns null when verifying an expired token', () => {
		const now = 1000000000;
		vi.useFakeTimers();
		vi.setSystemTime(now * 1000);

		const token = jwtService.sign({ sub: 'user_expired' }, -10);
		expect(jwtService.verify(token)).toBeNull();
	});

	// --- Malformed Payload ---
	it('returns null when decoding malformed payload JSON or base64 data', () => {
		const validToken = jwtService.sign({ sub: 'user_123' });
		const [header, _, signature] = validToken.split('.');
		const badPayloadToken = `${header}.notbase64orjson.${signature}`;

		expect(jwtService.verify(badPayloadToken)).toBeNull();
	});

	// --- Default Constructor Fallback ---
	it('falls back to default ENV secret when no secret is provided', () => {
		const defaultService = new JwtService();
		expect(defaultService).toBeInstanceOf(JwtService);
	});

	// --- Unexpected Verification Exceptions ---
	it('handles unexpected exceptions during verification gracefully', () => {
		const decodeSpy = vi
			.spyOn(JwtService.prototype as any, 'base64UrlDecode')
			.mockImplementationOnce(() => {
				throw new Error('Unexpected decode failure');
			});

		const token = jwtService.sign({ sub: 'user_123' });
		expect(jwtService.verify(token)).toBeNull();
		decodeSpy.mockRestore();
	});
});
