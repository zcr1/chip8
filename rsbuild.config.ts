import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
	plugins: [pluginSass(), pluginReact()],
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
		],
	},
});
