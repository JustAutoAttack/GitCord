import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { AuthClient } from '@lib/server';

export const AuthCallbackPage = () => {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	);

	useEffect(() => {
		const handleCallback = () => {
			const success = searchParams.get('success');
			const client = searchParams.get('client') as AuthClient | null;
			const accessToken = searchParams.get('accessToken');
			const refreshToken = searchParams.get('refreshToken');

			if (
				success !== 'true' ||
				(client !== 'browser' && client !== 'tauri') ||
				!accessToken ||
				!refreshToken
			) {
				setStatus('error');
				return;
			}

			if (client === 'tauri') {
				const deepLinkUrl =
					`gitcord://auth/callback` +
					`?success=true` +
					`&accessToken=${encodeURIComponent(accessToken)}` +
					`&refreshToken=${encodeURIComponent(refreshToken)}`;

				window.location.href = deepLinkUrl;

				setStatus('success');
				return;
			}

			const channel = new BroadcastChannel('gitcord-auth');

			channel.postMessage({
				success: true,
				accessToken,
				refreshToken
			});

			channel.close();

			setStatus('success');
		};

		handleCallback();
	}, [searchParams]);

	return (
		<div className='flex h-screen items-center justify-center bg-gray-950 text-white'>
			<div className='text-center p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl max-w-md w-full'>
				{status === 'loading' && (
					<p className='text-gray-400'>
						Finalizing authentication...
					</p>
				)}

				{status === 'success' && (
					<>
						<h2 className='text-2xl font-bold mb-2 text-emerald-400'>
							Authentication Successful!
						</h2>

						<p className='text-gray-400 text-sm mb-6'>
							Your Discord account has been successfully
							connected. You can now close this window.
						</p>

						<button
							onClick={() => window.close()}
							className='w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 font-medium rounded-xl transition duration-200 cursor-pointer'
						>
							Close Window
						</button>
					</>
				)}

				{status === 'error' && (
					<>
						<h2 className='text-2xl font-bold mb-2 text-red-400'>
							Authentication Failed
						</h2>

						<p className='text-gray-400 text-sm mb-6'>
							Something went wrong during the Discord sign-in
							process. Please close this window and try again.
						</p>

						<button
							onClick={() => window.close()}
							className='w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 font-medium rounded-xl transition duration-200 cursor-pointer'
						>
							Close Window
						</button>
					</>
				)}
			</div>
		</div>
	);
};
