import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { serverDiscordService } from '@lib/server';

import { useUser } from '@features/user';
import { DiscordContext, IDiscordContext } from './DiscordContext';

export const DiscordProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const { user } = useUser();

	const [discordUser, setDiscordUser] =
		useState<IDiscordContext['user']>(null);

	const [guilds, setGuilds] = useState<IDiscordContext['guilds']>([]);
	const [isLoading, setIsLoading] =
		useState<IDiscordContext['isLoading']>(false);
	const [error, setError] = useState<IDiscordContext['error']>(null);

	const refresh: IDiscordContext['refresh'] = useCallback(async () => {
		if (!user) {
			setDiscordUser(null);
			setGuilds([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const [discordUserResponse, guildsResponse] = await Promise.all([
				serverDiscordService.getUser(user.discordId),
				serverDiscordService.getGuilds(user.discordId)
			]);

			setDiscordUser(discordUserResponse);
			setGuilds(guildsResponse);
		} catch (error) {
			const normalizedError =
				error instanceof Error
					? error
					: new Error('Failed to fetch Discord data.');

			setDiscordUser(null);
			setGuilds([]);
			setError(normalizedError);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const value = useMemo<IDiscordContext>(
		() => ({
			user: discordUser,
			guilds,
			isLoading,
			error,
			refresh
		}),
		[discordUser, guilds, isLoading, error, refresh]
	);

	return (
		<DiscordContext.Provider value={value}>
			{children}
		</DiscordContext.Provider>
	);
};
