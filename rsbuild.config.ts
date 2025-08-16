import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
	plugins: [pluginSass(), pluginReact()],
	html: {
		title: 'Chip8 Emulator',
	},
});
