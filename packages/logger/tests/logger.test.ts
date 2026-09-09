import { beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Logger } from '../src/logger';
import { createLogger } from '../src/index';
import type { LoggerConfig } from '../src/types';

const config: LoggerConfig = {
	level: 'TRACE',
	timestampFormat: 'ISO',
	colors: {
		trace: 0x808080,
		debug: 0x00bfff,
		info: 0x32cd32,
		warn: 0xffd700,
		error: 0xff4500
	}
};

describe('Logger', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	// ==========================================
	// Basic Logging Methods
	// ==========================================

	const logMethods = [
		{ level: 'trace', consoleMethod: 'debug', message: 'trace message' },
		{ level: 'debug', consoleMethod: 'debug', message: 'debug message' },
		{ level: 'info', consoleMethod: 'log', message: 'info message' },
		{ level: 'warn', consoleMethod: 'warn', message: 'warning message' },
		{ level: 'error', consoleMethod: 'error', message: 'error message' }
	] as const;

	test.each(logMethods)(
		'logs $level messages',
		({ level, consoleMethod, message }) => {
			const spy = vi
				.spyOn(console, consoleMethod)
				.mockImplementation(() => undefined);

			const logger = new Logger('Test', { color: 0x32cd32 });

			vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
				'TRACE'
			);
			(logger as any).config.colors = config.colors;

			logger[level](message);

			expect(spy).toHaveBeenCalledOnce();
			expect(spy.mock.calls[0]?.[0]).toEqual(
				expect.stringContaining(message)
			);
		}
	);

	// ==========================================
	// Formatting & Output
	// ==========================================

	it('includes the logger name, level, timestamp, and message', () => {
		vi.setSystemTime(new Date('2026-09-08T12:34:56.000Z'));

		const spy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const logger = new Logger('TestName', { color: 0x32cd32 });
		vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
			'TRACE'
		);
		(logger as any).config.colors = config.colors;
		(logger as any).config.timestampFormat = 'ISO';

		logger.info('hello');

		const output = spy.mock.calls[0]?.[0] as string;

		expect(output).toContain('TestName');
		expect(output).toContain('[INFO]');
		expect(output).toContain('[2026-09-08T12:34:56.000Z]');
		expect(output).toContain('hello');
	});

	it('passes additional arguments through to the console', () => {
		const spy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const logger = new Logger('Test', { color: 0x32cd32 });
		vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
			'TRACE'
		);
		(logger as any).config.colors = config.colors;

		const data = { id: 123, name: 'GitCord' };

		logger.info('repository loaded', data);

		expect(spy).toHaveBeenCalledWith(expect.any(String), data);
	});

	it('colorizes the log level and message', () => {
		const spy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const logger = new Logger('Test', { color: 0x32cd32 });
		vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
			'TRACE'
		);
		(logger as any).config.colors = config.colors;

		logger.info('hello');

		const output = spy.mock.calls[0]?.[0] as string;

		expect(output).toContain('\x1b[38;2;50;205;50m[INFO]');
		expect(output).toContain('\x1b[38;2;50;205;50mhello');
		expect(output).toContain('\x1b[0m');
	});

	// ==========================================
	// Log Level Filtering
	// ==========================================

	it('filters messages below the configured level', () => {
		const debugSpy = vi
			.spyOn(console, 'debug')
			.mockImplementation(() => undefined);

		const infoSpy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const logger = new Logger('Test', { color: 0x32cd32 });
		vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
			'INFO'
		);

		logger.debug('should not appear');
		logger.info('should appear');

		expect(debugSpy).not.toHaveBeenCalled();
		expect(infoSpy).toHaveBeenCalledOnce();
	});

	it('filters each lower log level when a higher minimum is configured', () => {
		const debugSpy = vi
			.spyOn(console, 'debug')
			.mockImplementation(() => undefined);

		const infoSpy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const warnSpy = vi
			.spyOn(console, 'warn')
			.mockImplementation(() => undefined);

		const errorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		const getLoggerAtLevel = (level: LoggerConfig['level']) => {
			const l = new Logger('Test', { color: 0x32cd32 });
			vi.spyOn((l as any).config, 'level', 'get').mockReturnValue(level);
			return l;
		};

		getLoggerAtLevel('DEBUG').trace('hidden');
		getLoggerAtLevel('INFO').debug('hidden');
		getLoggerAtLevel('WARN').info('hidden');
		getLoggerAtLevel('ERROR').warn('hidden');

		expect(debugSpy).not.toHaveBeenCalled();
		expect(infoSpy).not.toHaveBeenCalled();
		expect(warnSpy).not.toHaveBeenCalled();
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it('allows ERROR messages when the level is ERROR', () => {
		const infoSpy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const errorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		const logger = new Logger('Test', { color: 0x32cd32 });
		vi.spyOn((logger as any).config, 'level', 'get').mockReturnValue(
			'ERROR'
		);

		logger.info('hidden');
		logger.error('visible');

		expect(infoSpy).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledOnce();
	});

	// ==========================================
	// Initialization & Public API
	// ==========================================

	it('creates a logger through the public API factory', () => {
		const logger = createLogger('Test', { color: 0x32cd32 });

		expect(logger).toBeInstanceOf(Logger);
	});

	it('loads the default configuration when no config is provided', () => {
		const spy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		const logger = new Logger('Test');

		logger.info('default config');

		expect(spy).toHaveBeenCalledOnce();
		expect(spy.mock.calls[0]?.[0]).toEqual(
			expect.stringContaining('[INFO]')
		);
	});
});
