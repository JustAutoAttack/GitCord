import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

export const logger = createLogger('API', {
	color: hexToNumber('#ff8800'),
	home: 'src/gateway/api'
});
