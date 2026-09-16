import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

const APP_COLOR = hexToNumber('#00fff2');
const WS_COLOR = hexToNumber('#5900ff');

export const appLogger = createLogger('App', { color: APP_COLOR, home: 'src' });
export const wsLogger = createLogger('WS', { color: WS_COLOR });
