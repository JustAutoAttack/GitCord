import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthPage, AuthCallbackPage, AuthProvider } from '@features/auth';
import { HomePage } from '@features/home';
import { ServerDashboardPage } from '@features/server';
import { DeepLinkHandler } from './DeepLinkHandler';

export const AppRouter = () => {
	return (
		<BrowserRouter>
			<DeepLinkHandler />
			<AuthProvider>
				<Routes>
					<Route
						path='/auth'
						element={<AuthPage />}
					/>
					<Route
						path='/auth/callback'
						element={<AuthCallbackPage />}
					/>
					<Route
						path='/home'
						element={<HomePage />}
					/>
					<Route
						path='/server/:serverId'
						element={<ServerDashboardPage />}
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
			</AuthProvider>
		</BrowserRouter>
	);
};
