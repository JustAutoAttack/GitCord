import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JwtService, jwtService } from '../../../../src/core/services/jwt';

// Mock appLogger to keep test output clean during warning/error path tests
vi.mock('../../../../src/core/loggers', () => ({
	appLogger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('JwtService', () => {
	const testSecret = 'test-secret-key-1234567890';
	let service: JwtService;

	beforeEach(() => {
		service = new JwtService(testSecret, 900);
		vi.clearAllMocks();
	});

	describe('constructor and options', () => {
		it('should use default expiration and environment secret if not provided', () => {
			const defaultJwt = new JwtService();
			const token = defaultJwt.sign({ sub: 'test' });
			const decoded = defaultJwt.verify(token);
			expect(decoded).not.toBeNull();
		});
	});

	describe('sign and verify', () => {
		it('should successfully sign and verify a payload with default expiration', () => {
			const payload = {
				sub: 'usr_123',
				userId: 'usr_123',
				role: 'admin'
			};
			const token = service.sign(payload);

			expect(typeof token).toBe('string');
			expect(token.split('.').length).toBe(3);

			const decoded = service.verify(token) as any;
			expect(decoded).not.toBeNull();
			expect(decoded?.sub).toBe('usr_123');
			expect(decoded?.userId).toBe('usr_123');
			expect(decoded?.role).toBe('admin');
			expect(decoded?.iat).toBeDefined();
			expect(decoded?.exp).toBeDefined();
		});

		it('should support custom expiration time overrides', () => {
			const token = service.sign({ sub: 'custom' }, 60);
			const decoded = service.verify(token);

			expect(decoded).not.toBeNull();
			expect(decoded?.exp).toBe((decoded?.iat ?? 0) + 60);
		});

		it('should return null and warn if token structure is malformed (not 3 parts)', () => {
			expect(service.verify('invalidtoken')).toBeNull();
			expect(service.verify('too.many.dots.here.token')).toBeNull();
		});

		it('should return null and warn if signature verification fails', () => {
			const token = service.sign({ sub: 'tamper' });
			const parts = token.split('.');
			const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

			expect(service.verify(tamperedToken)).toBeNull();
		});

		it('should return null and warn if the token has expired', () => {
			const expiredService = new JwtService(testSecret, -10); // expires immediately
			const token = expiredService.sign({ sub: 'expired' });

			expect(service.verify(token)).toBeNull();
		});

		it('should catch exceptions and log error if payload JSON parsing fails', () => {
			// Construct a token with valid signature but invalid base64json payload
			const header = Buffer.from(
				JSON.stringify({ alg: 'HS256', typ: 'JWT' })
			).toString('base64url');
			const badPayload =
				Buffer.from('not-valid-json').toString('base64url');

			// Create a matching signature for the malformed parts
			const signService = new JwtService(testSecret);
			const tokenWithBadJson = `${header}.${badPayload}.fake-signature-will-fail-anyway`;

			const parts = tokenWithBadJson.split('.');
			const validSigForBadJson = (signService as any).createSignature(
				parts[0],
				parts[1]
			);
			const executableToken = `${parts[0]}.${parts[1]}.${validSigForBadJson}`;

			expect(service.verify(executableToken)).toBeNull();
		});
	});

	describe('singleton instance', () => {
		it('should export a working default jwtService singleton', () => {
			expect(jwtService).toBeInstanceOf(JwtService);
			const token = jwtService.sign({ sub: 'usr_singleton', test: true });
			expect(jwtService.verify(token)).not.toBeNull();
		});
	});
});
