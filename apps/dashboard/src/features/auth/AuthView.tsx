import { openUrl } from '@tauri-apps/plugin-opener';

export const AuthView = () => {
	const handleLogin = async () => {
		const authUrl =
			'https://flanking-average-preamble.ngrok-free.dev/api/v1/auth/discord';

		// Safe runtime check for Tauri environment using type casting
		const win = window as any;
		const isTauri =
			typeof window !== 'undefined' &&
			(win.__TAURI_INTERNALS__ !== undefined ||
				win.__TAURI__ !== undefined);

		if (isTauri) {
			try {
				await openUrl(authUrl);
				return;
			} catch (error) {
				console.error('Failed to open via Tauri opener plugin:', error);
			}
		}

		// Fallback for standard web browser environment
		window.location.href = authUrl;
	};

	return (
		<div className='flex h-screen items-center justify-center bg-gray-950 text-white'>
			<div className='text-center p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl max-w-md w-full'>
				<h1 className='text-3xl font-extrabold mb-2 tracking-tight'>
					GitCord
				</h1>
				<p className='text-gray-400 mb-6 text-sm'>
					Connect your GitHub workflows to Discord
				</p>
				<button
					onClick={handleLogin}
					className='w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 cursor-pointer'
				>
					Sign in with Discord
				</button>
			</div>
		</div>
	);
};
