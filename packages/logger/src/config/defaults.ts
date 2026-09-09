import type { LoggerConfig } from '../types';

export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
	level: 'DEBUG',
	timestampFormat: 'ISO',
	colors: {
		trace: 0x808080,
		debug: 0x00bfff,
		info: 0x32cd32,
		warn: 0xffd700,
		error: 0xff4500
	}
};
