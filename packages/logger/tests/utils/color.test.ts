import { describe, expect, it, test } from 'vitest';

import { colorize, hexToAnsi, parseHex } from '../../src/utils/color';

describe('hexToAnsi', () => {
	// ==========================================
	// True-color ANSI Sequence Conversion
	// ==========================================

	const ansiTestCases = [
		{ hex: 0xff0000, expected: '\x1b[38;2;255;0;0m' },
		{ hex: 0x00ff00, expected: '\x1b[38;2;0;255;0m' },
		{ hex: 0x0000ff, expected: '\x1b[38;2;0;0;255m' }
	];

	test.each(ansiTestCases)(
		'converts hex 0x$hex to true-color ANSI',
		({ hex, expected }) => {
			expect(hexToAnsi(hex)).toBe(expected);
		}
	);
});

describe('colorize', () => {
	// ==========================================
	// Color Wrapping
	// ==========================================

	it('wraps text in ANSI color and reset codes', () => {
		expect(colorize('hello', 0xff0000)).toBe(
			'\x1b[38;2;255;0;0mhello\x1b[0m'
		);
	});
});

describe('parseHex', () => {
	// ==========================================
	// Hex Parsing & Validation
	// ==========================================

	const validHexes = [
		{ input: 'ff0000', expected: 0xff0000 },
		{ input: '#00ff00', expected: 0x00ff00 },
		{ input: '0000FF', expected: 0x0000ff },
		{ input: '  #ff0000  ', expected: 0xff0000 }
	];

	test.each(validHexes)(
		'parses valid hex "$input"',
		({ input, expected }) => {
			expect(parseHex(input)).toBe(expected);
		}
	);

	const invalidHexes = ['fff', '#fff', 'gggggg', ''];

	test.each(invalidHexes)('rejects invalid hex "$input"', (input) => {
		expect(parseHex(input)).toBeUndefined();
	});
});
