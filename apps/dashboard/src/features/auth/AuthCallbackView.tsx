import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AuthCallbackView = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const code = searchParams.get('code');

	useEffect(() => {
		if (!code) {
			navigate('/auth', { replace: true });
			return;
		}

		fetch(
			`https://flanking-average-preamble.ngrok-free.dev/api/v1/auth/discord/callback?code=${code}`
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					navigate('/home', { replace: true });
				} else {
					navigate('/auth', { replace: true });
				}
			})
			.catch(() => navigate('/auth', { replace: true }));
	}, [code, navigate]);

	return (
		<div className='flex h-screen items-center justify-center bg-gray-950 text-white'>
			<p className='text-gray-400'>Authenticating with Discord...</p>
		</div>
	);
};
