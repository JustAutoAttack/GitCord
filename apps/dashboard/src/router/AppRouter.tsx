import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthView, AuthCallbackView } from '@features/auth';
import { HomeView } from '@features/home';
import { ServerDashboardView } from '@features/server';

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/auth'
					element={<AuthView />}
				/>
				<Route
					path='/auth/callback'
					element={<AuthCallbackView />}
				/>
				<Route
					path='/home'
					element={<HomeView />}
				/>
				<Route
					path='/server/:serverId'
					element={<ServerDashboardView />}
				/>
				<Route
					path='*'
					element={
						<Navigate
							to='/auth'
							replace
						/>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};
