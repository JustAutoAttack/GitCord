import { describe, expect, it, vi } from 'vitest';

import { getTimestamp } from '../../src/utils/timestamp';

describe('getTimestamp', () => {
	// ==========================================
	// Timestamp Formatting
	// ==========================================

	it('returns an ISO timestamp', () => {
		const date = new Date('2026-09-08T12:34:56.000Z');
		vi.setSystemTime(date);

		expect(getTimestamp('ISO')).toBe('2026-09-08T12:34:56.000Z');

		vi.useRealTimers();
	});

	it('returns a Unix timestamp', () => {
		const date = new Date('2026-09-08T00:00:00.000Z');
		vi.setSystemTime(date);

		expect(getTimestamp('UNIX')).toBe(
			Math.floor(date.getTime() / 1000).toString()
		);

		vi.useRealTimers();
	});

	it('returns a locale timestamp', () => {
		const date = new Date('2026-09-08T12:34:56.000Z');
		vi.setSystemTime(date);

		expect(getTimestamp('LOCALE')).toBe(date.toLocaleString());

		vi.useRealTimers();
	});
});
