import colors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{tsx,ts,js,jsx}"],
	theme: {
		extend: {
			colors: {
				bg: "rgb(var(--color-bg))",
				text: "rgb(var(--color-text))",
				brand: colors.sky["700"],
			},
		},
	},
	plugins: [],
};
