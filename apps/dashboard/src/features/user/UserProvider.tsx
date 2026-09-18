import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { serverUserService } from '@lib/server';
import { UserContext, IUserContext } from './UserContext';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const [user, setUser] = useState<IUserContext['user']>(null);
	const [isLoading, setIsLoading] = useState<IUserContext['isLoading']>(true);
	const [error, setError] = useState<IUserContext['error']>(null);

	const refresh: IUserContext['refresh'] = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await serverUserService.getCurrentUser();

			setUser({
				id: response.id,
				discordId: response.discordId,
				displayName: response.displayName,
				avatarUrl: response.avatarUrl,
				createdAt: new Date(response.createdAt),
				updatedAt: new Date(response.updatedAt)
			});
		} catch (error) {
			const normalizedError =
				error instanceof Error
					? error
					: new Error('Failed to fetch current user.');

			setUser(null);
			setError(normalizedError);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const value = useMemo<IUserContext>(
		() => ({
			user,
			isLoading,
			error,
			refresh
		}),
		[user, isLoading, error, refresh]
	);

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
};
