import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTauri } from '@tauri-apps/api/core';
import {
	getCurrent,
	onOpenUrl,
} from '@tauri-apps/plugin-deep-link';

export const DeepLinkHandler = () => {
	const navigate = useNavigate();

	useEffect(() => {
		if (!isTauri()) {
			return;
		}

		const handleUrl = (url: string) => {
			const parsedUrl = new URL(url);

			if (
				parsedUrl.protocol !== 'gitcord:' ||
				parsedUrl.hostname !== 'auth' ||
				parsedUrl.pathname !== '/callback'
			) {
				return;
			}

			const success = parsedUrl.searchParams.get('success');
			const accessToken = parsedUrl.searchParams.get('accessToken');
			const refreshToken = parsedUrl.searchParams.get('refreshToken');

			if (
				success !== 'true' ||
				!accessToken ||
				!refreshToken
			) {
				navigate('/auth', { replace: true });
				return;
			}

			localStorage.setItem(
				'gitcord_access_token',
				accessToken
			);

			localStorage.setItem(
				'gitcord_refresh_token',
				refreshToken
			);

			navigate('/home', { replace: true });
		};

		let unlisten: (() => void) | undefined;

		const initialize = async () => {
			unlisten = await onOpenUrl((urls) => {
				urls.forEach(handleUrl);
			});

			const currentUrls = await getCurrent();

			currentUrls?.forEach(handleUrl);
		};

		void initialize();

		return () => {
			unlisten?.();
		};
	}, [navigate]);

	return null;
};
