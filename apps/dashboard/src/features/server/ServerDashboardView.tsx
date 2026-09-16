import { useParams, useNavigate } from 'react-router-dom';

export const ServerDashboardView = () => {
	const { serverId } = useParams();
	const navigate = useNavigate();

	return (
		<div className='flex h-screen bg-gray-950 text-white overflow-hidden'>
			<aside className='w-64 border-r border-gray-800 bg-gray-900/50 flex flex-col justify-between'>
				<div>
					<div className='p-4 border-b border-gray-800 flex items-center justify-between'>
						<span className='font-bold text-sm'>
							Server #{serverId}
						</span>
						<button
							onClick={() => navigate('/home')}
							className='text-xs text-gray-400 hover:text-white cursor-pointer'
						>
							&larr; Back
						</button>
					</div>
					<nav className='p-4 space-y-1'>
						<a
							href='#overview'
							className='block px-3 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 text-sm font-medium'
						>
							Overview
						</a>
						<a
							href='#github'
							className='block px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition'
						>
							GitHub Integration
						</a>
						<a
							href='#settings'
							className='block px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition'
						>
							Bot Settings
						</a>
						<a
							href='#managers'
							className='block px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition'
						>
							Bot Managers
						</a>
					</nav>
				</div>

				<div className='p-3 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between bg-gray-950'>
					<span className='flex items-center gap-1.5'>
						<span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
						Bot Shard Online
					</span>
					<span>API Connected</span>
				</div>
			</aside>

			<main className='flex-1 p-8 overflow-y-auto'>
				<h1 className='text-2xl font-bold mb-2'>
					Server Management Dashboard
				</h1>
				<p className='text-gray-400 text-sm mb-6'>
					Configure webhooks, permissions, and event notifications.
				</p>

				<div className='bg-gray-900 border border-gray-800 rounded-2xl p-6'>
					<h3 className='font-semibold mb-2'>
						Connected Repositories
					</h3>
					<p className='text-sm text-gray-400'>
						No GitHub repositories linked to this server yet.
					</p>
				</div>
			</main>
		</div>
	);
};
