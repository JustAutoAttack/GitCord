import { IConfig } from './types';

export const defaultConfig: IConfig = {
	loggers: {
		app: 0xff3c00,
		serverApi: 0xff9100,
		discord: 0x0077ff,
		github: 0xcc00ff,
		http: 0x00ff2a
	},
	discord: {
		colors: {
			online: 0x238636,
			offline: 0xda3633
		}
	},
	github: {
		colors: {
			push: 0x2f81f7,
			pullRequest: 0x238636,
			issue: 0x8957e5,
			create: 0xda3633,
			fork: 0xdb6d28,
			watch: 0xf0883e,
			release: 0x7ee787
		}
	}
};
