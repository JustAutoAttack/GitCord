import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

export const appLogger = createLogger('App', {
	color: hexToNumber('#0044ff'),
	home: 'src'
});
