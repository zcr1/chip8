import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
	plugins: [pluginSass(), pluginReact()],
	output: {
		assetPrefix: '/chip8/',
	},
	html: {
		title: 'Chip8 Emulator',
		tags: [
			{
				tag: 'link',
				attrs: {
					rel: 'stylesheet',
					href: 'https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.css',
				},
				head: true,
			},
			{
				tag: 'script',
				attrs: {
					src: 'https://www.googletagmanager.com/gtag/js?id=G-ZT5KEBKGMT"',
					type: 'text/javascript',
					async: true,
				},
				head: true,
			},
		],
	},
});
