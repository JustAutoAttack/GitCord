import { describe, it, expect } from 'vitest';
import { Responses, ErrorCode } from '@core';

describe('Responses Utility', () => {
	// --- Success Responses ---
	it('creates a success response with optional message', () => {
		const res1 = Responses.success({ id: 1 });
		expect(res1).toEqual({ success: true, data: { id: 1 } });

		const res2 = Responses.success({ id: 1 }, 'Custom message');
		expect(res2).toEqual({
			success: true,
			data: { id: 1 },
			message: 'Custom message'
		});
	});

	// --- Created Responses ---
	it('creates a created response with default or custom message', () => {
		const res1 = Responses.created({ id: 1 });
		expect(res1).toEqual({
			success: true,
			data: { id: 1 },
			message: 'Resource created successfully'
		});

		const res2 = Responses.created({ id: 1 }, 'Custom created');
		expect(res2).toEqual({
			success: true,
			data: { id: 1 },
			message: 'Custom created'
		});
	});

	// --- Error Responses ---
	it('creates an error response with error code or custom message', () => {
		const res1 = Responses.error(ErrorCode.NOT_FOUND);
		expect(res1).toEqual({ success: false, error: ErrorCode.NOT_FOUND });

		const res2 = Responses.error(ErrorCode.BAD_REQUEST, 'Custom error');
		expect(res2).toEqual({ success: false, error: 'Custom error' });
	});
});
