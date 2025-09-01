// @ts-nocheck
import { useEffect } from 'react';

export const useGTM = () => {
	useEffect(() => {
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-ZT5KEBKGMT');
	}, []);
};
