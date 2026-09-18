import { useEffect, useState } from 'react';
import { isTauri } from '@tauri-apps/api/core';

import bgLandscape from '@assets/auth-background-landscape.png';
import bgPortrait from '@assets/auth-background-portrait.png';
import { useAuth } from '../useAuth';

export const AuthPage = () => {
	const { signIn } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [isPortrait, setIsPortrait] = useState(
		window.innerWidth < window.innerHeight
	);

	useEffect(() => {
		const handleResize = () => {
			setIsPortrait(window.innerWidth < window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleLogin = async () => {
		setIsLoading(true);

		const client = isTauri() ? 'tauri' : 'browser';

		try {
			await signIn(client);
		} catch (error) {
			console.error('Authentication failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='fixed inset-0 h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950 text-white select-none'>
			<img
				src={isPortrait ? bgPortrait : bgLandscape}
				alt=''
				className='absolute inset-0 w-full h-full object-fill opacity-65 pointer-events-none'
			/>

			<div className='relative text-center max-w-sm w-full mx-4 z-10'>
				<button
					onClick={handleLogin}
					disabled={isLoading}
					className='w-full py-3.5 px-6 bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] font-medium text-white rounded-2xl transition-all duration-200 shadow-xl shadow-[#5865F2]/30 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/10'
				>
					{isLoading ? (
						<span className='inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
					) : (
						<span className='font-semibold text-sm sm:text-base'>
							Continue with Discord
						</span>
					)}
				</button>
			</div>
		</div>
	);
};
