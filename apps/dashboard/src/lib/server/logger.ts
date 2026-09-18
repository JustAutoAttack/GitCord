import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

export const logger = createLogger('Server', {
	color: hexToNumber('#00fff2'),
	home: 'src/lib/server'
});
