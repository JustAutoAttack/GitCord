import { createContext } from 'react';

import { DiscordGuild, DiscordUser } from '@types';

export interface IDiscordContext {
	user: DiscordUser | null;
	guilds: DiscordGuild[];
	isLoading: boolean;
	error: Error | null;
	refresh: () => Promise<void>;
}

export const DiscordContext = createContext<IDiscordContext | undefined>(
	undefined
);
