import { addDynamicIconSelectors } from '@iconify/tailwind';
import colorMix from 'tailwindcss-color-mix';

//import colors from 'tailwindcss/colors.js';
const rgbToHex = (r, g, b) =>
	"#" + [r, g, b]
		.map((s) => parseInt(s))
		.map((x) => {
			const hex = x.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		}).join("");

const css = Deno.readTextFileSync("./src/app.css");
export const bgColor = rgbToHex(
	...css.match(/--color-bg: (\d+ \d+ \d+)/)[1].split(/\s+/),
);
const brandSvg = Deno.readTextFileSync("./assets/favicon.svg");
export const brandColor = brandSvg.match(/fill="(#[^"]*)"/)[1];

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{tsx,ts,js,jsx}"],
	theme: {
		extend: {
			colors: {
				bg: "rgb(var(--color-bg))",
				text: "rgb(var(--color-text))",
				icon: "rgb(var(--color-icon))",
				primary: "rgb(var(--color-primary))",
			},
		},
	},
	plugins: [
		addDynamicIconSelectors({
			prefix: "icon",
			overrideOnly: true,
		}),
		colorMix(),
	],
};
