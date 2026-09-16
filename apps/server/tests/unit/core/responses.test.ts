import { describe, it, expect } from 'vitest';
import { Responses } from '../../../src/core/responses';

describe('Responses Utility', () => {
	describe('success', () => {
		it('should return a success response without a message', () => {
			const data = { id: 1, name: 'Test' };
			const result = Responses.success(data);

			expect(result).toEqual({
				success: true,
				data
			});
		});

		it('should return a success response with a custom message', () => {
			const data = [1, 2, 3];
			const message = 'Fetched successfully';
			const result = Responses.success(data, message);

			expect(result).toEqual({
				success: true,
				data,
				message
			});
		});
	});

	describe('created', () => {
		it('should return a created response with the default message', () => {
			const data = { id: 2 };
			const result = Responses.created(data);

			expect(result).toEqual({
				success: true,
				data,
				message: 'Resource created successfully'
			});
		});

		it('should return a created response with a custom message', () => {
			const data = { id: 2 };
			const message = 'User registered';
			const result = Responses.created(data, message);

			expect(result).toEqual({
				success: true,
				data,
				message
			});
		});
	});

	describe('error', () => {
		it('should return an error response using the error code as the error value when message is omitted', () => {
			const code = 'UNAUTHORIZED' as any;
			const result = Responses.error(code);

			expect(result).toEqual({
				success: false,
				error: 'UNAUTHORIZED'
			});
		});

		it('should return an error response using the custom message when provided', () => {
			const code = 'BAD_REQUEST' as any;
			const message = 'Invalid payload data';
			const result = Responses.error(code, message);

			expect(result).toEqual({
				success: false,
				error: message
			});
		});
	});
});
