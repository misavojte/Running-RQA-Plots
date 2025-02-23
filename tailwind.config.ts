import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			screens: {
				"3xl": "1920px",
			}
		}
	},

	plugins: []
} satisfies Config;
