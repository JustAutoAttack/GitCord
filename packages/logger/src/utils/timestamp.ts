import type { TimestampFormat } from '../types';

export function getTimestamp(format: TimestampFormat): string {
	switch (format) {
		case 'LOCALE':
			return new Date().toLocaleString();

		case 'UNIX':
			return Math.floor(Date.now() / 1000).toString();

		case 'ISO':
		default:
			return new Date().toISOString();
	}
}
