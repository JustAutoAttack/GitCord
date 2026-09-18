import React, { useMemo } from 'react';

import { HomeContext, IHomeContext } from './HomeContext';

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const value = useMemo<IHomeContext>(() => ({}), []);

	return (
		<HomeContext.Provider value={value}>{children}</HomeContext.Provider>
	);
};
