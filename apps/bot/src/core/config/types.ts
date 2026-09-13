export interface LoggersColorsConfig {
	app: number;
	serverApi: number;
	discord: number;
	github: number;
	http: number;
}

export interface DiscordColorsConfig {
	online: number;
	offline: number;
}

export interface GithubColorsConfig {
	push: number;
	pullRequest: number;
	issue: number;
	create: number;
	fork: number;
	watch: number;
	release: number;
}

export interface IConfig {
	loggers: LoggersColorsConfig;
	discord: {
		colors: DiscordColorsConfig;
	};
	github: {
		colors: GithubColorsConfig;
	};
}
