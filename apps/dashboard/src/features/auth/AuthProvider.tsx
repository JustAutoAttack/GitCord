import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { isTauri } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';

import { serverAuthService } from '@lib/server';
import { AuthContext, IAuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const navigate = useNavigate();

	const [accessToken, setAccessToken] =
		useState<IAuthContext['accessToken']>(null);

	const [refreshToken, setRefreshToken] =
		useState<IAuthContext['refreshToken']>(null);

	const [isLoading, setIsLoading] = useState<IAuthContext['isLoading']>(true);

	useEffect(() => {
		if (isTauri()) {
			return;
		}

		const channel = new BroadcastChannel('gitcord-auth');

		channel.onmessage = (event) => {
			const {
				success,
				accessToken: tokenParam,
				refreshToken: refreshTokenParam
			} = event.data;

			if (!success || !tokenParam) {
				return;
			}

			localStorage.setItem('accessToken', tokenParam);

			if (refreshTokenParam) {
				localStorage.setItem('refreshToken', refreshTokenParam);
			}

			setAccessToken(tokenParam);
			setRefreshToken(refreshTokenParam);

			navigate('/home', { replace: true });
		};

		return () => {
			channel.close();
		};
	}, [navigate]);

	useEffect(() => {
		const storedAccessToken = localStorage.getItem('accessToken');
		const storedRefreshToken = localStorage.getItem('refreshToken');

		if (storedAccessToken) {
			setAccessToken(storedAccessToken);
			setRefreshToken(storedRefreshToken);
		}

		setIsLoading(false);
	}, []);

	const signIn: IAuthContext['signIn'] = useCallback(
		async (client: 'browser' | 'tauri') => {
			const authUrl = serverAuthService.getSignUpUrl(client);

			if (client === 'tauri') {
				await openUrl(authUrl);
				return;
			}

			const authWindow = window.open(
				authUrl,
				'gitcord-auth',
				'width=500,height=700,resizable=yes'
			);

			if (!authWindow) {
				throw new Error(
					'Failed to open authentication window. Please allow popups and try again.'
				);
			}
		},
		[]
	);

	const signOut: IAuthContext['signOut'] = useCallback(async () => {
		try {
			await serverAuthService.signOut();
		} catch (error) {
			console.error('Sign out request failed:', error);
		} finally {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');

			setAccessToken(null);
			setRefreshToken(null);

			navigate('/auth', { replace: true });
		}
	}, [navigate]);

	const value = {
		isAuthenticated: Boolean(accessToken),
		isLoading,
		accessToken,
		refreshToken,
		signIn,
		signOut
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
