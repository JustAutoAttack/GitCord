import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({
	default: {
		existsSync: vi.fn(),
		readFileSync: vi.fn()
	}
}));

import fs from 'node:fs';

import { loadLoggerConfig, resetLoggerConfig } from '../../src/config/loader';

const mockedFs = vi.mocked(fs);

describe('loadLoggerConfig', () => {
	beforeEach(() => {
		resetLoggerConfig();

		mockedFs.existsSync.mockReset();
		mockedFs.readFileSync.mockReset();
	});

	// ==========================================
	// Defaults & Missing Configurations
	// ==========================================

	it('returns defaults when no config file exists', () => {
		mockedFs.existsSync.mockReturnValue(false);

		expect(loadLoggerConfig()).toEqual({
			level: 'INFO',
			timestampFormat: 'ISO',
			colors: {
				debug: 0x00bfff,
				info: 0x32cd32,
				warn: 0xffd700,
				error: 0xff4500
			}
		});

		expect(mockedFs.existsSync).toHaveBeenCalledTimes(2);
	});

	// ==========================================
	// Custom File Loading & Formats
	// ==========================================

	it('loads a complete TOML configuration', () => {
		mockedFs.existsSync
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' +
				'level = "DEBUG"\n' +
				'timestampFormat = "UNIX"\n' +
				'\n' +
				'[logger.colors]\n' +
				'debug = "#112233"\n' +
				'info = "#445566"\n' +
				'warn = "#778899"\n' +
				'error = "#AABBCC"\n'
		);

		const config = loadLoggerConfig();

		expect(config).toEqual({
			level: 'DEBUG',
			timestampFormat: 'UNIX',
			colors: {
				debug: 0x112233,
				info: 0x445566,
				warn: 0x778899,
				error: 0xaabbcc
			}
		});

		expect(mockedFs.readFileSync).toHaveBeenCalledOnce();
	});

	it('loads the config file from the config directory', () => {
		mockedFs.existsSync
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'level = "WARN"\n'
		);

		const config = loadLoggerConfig();

		expect(config.level).toBe('WARN');
		expect(mockedFs.existsSync).toHaveBeenCalledTimes(2);
		expect(mockedFs.readFileSync).toHaveBeenCalledOnce();
	});

	it('supports a top-level logger configuration', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'level = "ERROR"\n' +
				'timestampFormat = "LOCALE"\n' +
				'\n' +
				'[colors]\n' +
				'debug = "#010203"\n' +
				'info = "#040506"\n'
		);

		const config = loadLoggerConfig();

		expect(config.level).toBe('ERROR');
		expect(config.timestampFormat).toBe('LOCALE');
		expect(config.colors.debug).toBe(0x010203);
		expect(config.colors.info).toBe(0x040506);
	});

	it('uses the top-level configuration when logger is not an object', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'logger = "not-an-object"\n' +
				'level = "WARN"\n' +
				'timestampFormat = "UNIX"\n'
		);

		const config = loadLoggerConfig();

		expect(config.level).toBe('WARN');
		expect(config.timestampFormat).toBe('UNIX');
	});

	// ==========================================
	// Validation & Fallback Handling
	// ==========================================

	it('falls back to defaults for an invalid level', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'level = "NOT_A_LEVEL"\n'
		);

		expect(loadLoggerConfig().level).toBe('INFO');
	});

	it('normalizes the configured level', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'level = "debug"\n'
		);

		expect(loadLoggerConfig().level).toBe('DEBUG');
	});

	it('accepts the ISO timestamp format', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'timestampFormat = "ISO"\n'
		);

		expect(loadLoggerConfig().timestampFormat).toBe('ISO');
	});

	it('falls back to ISO for an invalid timestamp format', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'timestampFormat = "INVALID"\n'
		);

		expect(loadLoggerConfig().timestampFormat).toBe('ISO');
	});

	it('falls back to ISO when timestampFormat is not a string', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'timestampFormat = 123\n'
		);

		expect(loadLoggerConfig().timestampFormat).toBe('ISO');
	});

	it('uses default colors when the colors value is falsy', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue('[logger]\n' + 'colors = 0\n');

		const config = loadLoggerConfig();

		expect(config.colors).toEqual({
			debug: 0x00bfff,
			info: 0x32cd32,
			warn: 0xffd700,
			error: 0xff4500
		});
	});

	it('ignores an invalid colors value', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger]\n' + 'level = "INFO"\n' + 'colors = "not-an-object"\n'
		);

		const config = loadLoggerConfig();

		expect(config.colors).toEqual({
			debug: 0x00bfff,
			info: 0x32cd32,
			warn: 0xffd700,
			error: 0xff4500
		});
	});

	it('loads numeric color values', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger.colors]\n' + 'debug = 123456\n' + 'info = 654321\n'
		);

		const config = loadLoggerConfig();

		expect(config.colors.debug).toBe(123456);
		expect(config.colors.info).toBe(654321);
	});

	it('ignores unsupported color types', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger.colors]\n' + 'debug = true\n' + 'info = [1, 2, 3]\n'
		);

		const config = loadLoggerConfig();

		expect(config.colors.debug).toBe(0x00bfff);
		expect(config.colors.info).toBe(0x32cd32);
	});

	it('ignores unknown color keys', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger.colors]\n' +
				'debug = "#123456"\n' +
				'unknown = "#FFFFFF"\n'
		);

		const config = loadLoggerConfig();

		expect(config.colors.debug).toBe(0x123456);
		expect(Object.hasOwn(config.colors, 'unknown')).toBe(false);
	});

	it('ignores invalid hexadecimal colors', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'[logger.colors]\n' + 'debug = "#123"\n' + 'info = "not-a-color"\n'
		);

		const config = loadLoggerConfig();

		expect(config.colors.debug).toBe(0x00bfff);
		expect(config.colors.info).toBe(0x32cd32);
	});

	// ==========================================
	// Caching & Error Resilience
	// ==========================================

	it('caches the loaded configuration', () => {
		mockedFs.existsSync.mockReturnValue(false);

		const first = loadLoggerConfig();
		const callsAfterFirstLoad = mockedFs.existsSync.mock.calls.length;

		const second = loadLoggerConfig();

		expect(second).toBe(first);
		expect(mockedFs.existsSync).toHaveBeenCalledTimes(callsAfterFirstLoad);
	});

	it('reloads configuration after reset', () => {
		mockedFs.existsSync.mockReturnValue(false);

		const first = loadLoggerConfig();

		resetLoggerConfig();

		const second = loadLoggerConfig();

		expect(second).not.toBe(first);
		expect(mockedFs.existsSync).toHaveBeenCalledTimes(4);
	});

	it('falls back to defaults when the config cannot be read', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockImplementation(() => {
			throw new Error('read failed');
		});

		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		const config = loadLoggerConfig();

		expect(config.level).toBe('INFO');
		expect(config.timestampFormat).toBe('ISO');
		expect(consoleSpy).toHaveBeenCalledOnce();

		consoleSpy.mockRestore();
	});

	it('falls back to defaults when TOML is invalid', () => {
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(
			'this is definitely not valid TOML ='
		);

		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		const config = loadLoggerConfig();

		expect(config.level).toBe('INFO');
		expect(config.timestampFormat).toBe('ISO');
		expect(consoleSpy).toHaveBeenCalledOnce();

		consoleSpy.mockRestore();
	});
});
