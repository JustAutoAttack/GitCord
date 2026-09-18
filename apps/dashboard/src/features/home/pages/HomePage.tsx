import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { DiscordGuild } from '@types';

const INITIAL_SERVERS: DiscordGuild[] = [
	{
		id: '1',
		name: 'Devils Den',
		icon: null,
		owner: true,
		permissions: '8',
		isBotConnected: true,
		userRole: 'Owner'
	},
	{
		id: '2',
		name: 'Open Source Hub',
		icon: null,
		owner: false,
		permissions: '32',
		isBotConnected: true,
		userRole: 'Manager'
	},
	{
		id: '3',
		name: 'Gaming Lounge',
		icon: null,
		owner: false,
		permissions: '8',
		isBotConnected: false,
		userRole: 'Owner'
	}
];

export const HomePage = () => {
	const navigate = useNavigate();
	const [servers] = useState<DiscordGuild[]>(INITIAL_SERVERS);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedServerForSetup, setSelectedServerForSetup] =
		useState<DiscordGuild | null>(null);

	const handleCardClick = (server: DiscordGuild) => {
		if (server.isBotConnected) {
			navigate(`/server/${server.id}`);
		} else if (server.owner || server.permissions.includes('8')) {
			setSelectedServerForSetup(server);
			setIsModalOpen(true);
		}
	};

	return (
		<div className='min-h-screen bg-gray-950 text-white p-8'>
			<header className='flex justify-between items-center mb-8 pb-4 border-b border-gray-800'>
				<h1 className='text-2xl font-bold'>Your Servers</h1>
				<div className='text-sm text-gray-400'>Signed in as User</div>
			</header>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{servers.map((server) => (
					<div
						key={server.id}
						onClick={() => handleCardClick(server)}
						className={`p-6 rounded-2xl border transition duration-200 flex flex-col justify-between ${
							server.isBotConnected
								? 'bg-gray-900 border-gray-800 hover:border-indigo-500 cursor-pointer shadow-lg'
								: 'bg-gray-900/40 border-gray-800/60 opacity-75 hover:opacity-100 cursor-pointer'
						}`}
					>
						<div>
							<div className='flex items-center justify-between mb-4'>
								<div className='w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-lg'>
									{server.name.substring(0, 2).toUpperCase()}
								</div>
								<span
									className={`text-xs px-2.5 py-1 rounded-full font-medium ${
										server.isBotConnected
											? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
											: 'bg-gray-800 text-gray-400'
									}`}
								>
									{server.isBotConnected
										? 'Connected'
										: 'Not Connected'}
								</span>
							</div>
							<h3 className='font-semibold text-lg mb-1'>
								{server.name}
							</h3>
							<p className='text-xs text-gray-400'>
								Role: {server.userRole || 'Member'}
							</p>
						</div>

						<div className='mt-6 pt-4 border-t border-gray-800/60 flex justify-end'>
							{!server.isBotConnected &&
								(server.owner ||
									server.permissions.includes('8')) && (
									<span className='text-xs font-medium text-indigo-400 hover:text-indigo-300'>
										+ Add Bot Setup &rarr;
									</span>
								)}
						</div>
					</div>
				))}
			</div>

			{isModalOpen && selectedServerForSetup && (
				<div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4'>
					<div className='bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl'>
						<h2 className='text-xl font-bold mb-2'>
							Setup GitCord
						</h2>
						<p className='text-sm text-gray-400 mb-6'>
							Install the bot and initialize workspace
							configuration for{' '}
							<span className='text-white font-medium'>
								{selectedServerForSetup.name}
							</span>
							.
						</p>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => setIsModalOpen(false)}
								className='px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition cursor-pointer'
							>
								Cancel
							</button>
							<button
								onClick={() => {
									alert(
										`Initializing installation for ${selectedServerForSetup.name}`
									);
									setIsModalOpen(false);
								}}
								className='px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition cursor-pointer'
							>
								Authorize Bot
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
