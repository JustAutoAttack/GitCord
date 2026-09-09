import { describe, expect, test, it } from 'vitest';

import { LogLevel, isLogLevelName, parseLogLevel } from '../src/levels';

describe('LogLevel', () => {
	// ==========================================
	// LogLevel Enum Ordering
	// ==========================================

	it('has the expected ordering', () => {
		expect(LogLevel.TRACE).toBe(0);
		expect(LogLevel.DEBUG).toBe(1);
		expect(LogLevel.INFO).toBe(2);
		expect(LogLevel.WARN).toBe(3);
		expect(LogLevel.ERROR).toBe(4);
	});
});

describe('parseLogLevel', () => {
	// ==========================================
	// Level Parsing & Normalization
	// ==========================================

	const validLevels = [
		{ input: 'TRACE', expected: LogLevel.TRACE },
		{ input: 'DEBUG', expected: LogLevel.DEBUG },
		{ input: 'INFO', expected: LogLevel.INFO },
		{ input: 'WARN', expected: LogLevel.WARN },
		{ input: 'ERROR', expected: LogLevel.ERROR }
	] as const;

	test.each(validLevels)(
		'parses valid level "$input"',
		({ input, expected }) => {
			expect(parseLogLevel(input)).toBe(expected);
		}
	);

	const caseInsensitiveLevels = [
		{ input: 'trace', expected: LogLevel.TRACE },
		{ input: 'DeBuG', expected: LogLevel.DEBUG },
		{ input: 'info', expected: LogLevel.INFO },
		{ input: 'warn', expected: LogLevel.WARN },
		{ input: 'error', expected: LogLevel.ERROR }
	] as const;

	test.each(caseInsensitiveLevels)(
		'is case-insensitive for "$input"',
		({ input, expected }) => {
			expect(parseLogLevel(input)).toBe(expected);
		}
	);

	it('ignores surrounding whitespace', () => {
		expect(parseLogLevel('  DEBUG  ')).toBe(LogLevel.DEBUG);
	});

	const invalidInputs = ['invalid', '', undefined, null];

	test.each(invalidInputs)(
		'falls back to INFO for invalid value: %s',
		(value) => {
			expect(parseLogLevel(value)).toBe(LogLevel.INFO);
		}
	);
});

describe('isLogLevelName', () => {
	// ==========================================
	// Type Guard Verification
	// ==========================================

	const validNames = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

	test.each(validNames)('recognizes valid level name "%s"', (name) => {
		expect(isLogLevelName(name)).toBe(true);
	});

	const invalidValues = ['INVALID', '', undefined, null];

	test.each(invalidValues)('rejects invalid value: %s', (value) => {
		expect(isLogLevelName(value)).toBe(false);
	});
});
