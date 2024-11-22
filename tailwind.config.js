import { addDynamicIconSelectors } from "@iconify/tailwind";
import forms from "@tailwindcss/forms";
import colorMix from "tailwindcss-color-mix";

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
export const brandColor = rgbToHex(
	...css.match(/--color-primary: (\d+ \d+ \d+)/)[1].split(/\s+/),
);

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{tsx,ts,js,jsx}"],
	theme: {
		fontFamily: {
			// This is what tailwind applies to `html, :host`.
			sans: ['"Libre Baskerville"', "Ezra", "serif", "system-ui"],
			koine: ["KoineGreek"],
		},
		extend: {
			colors: {
				bg: "rgb(var(--color-bg))",
				text: "rgb(var(--color-text))",
				icon: "rgb(var(--color-icon))",
				primary: "rgb(var(--color-primary))",
				focus: "rgb(var(--color-focus))",
			},
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	plugins: [
		addDynamicIconSelectors({
			prefix: "icon",
			overrideOnly: true,
		}),
		colorMix(),
		forms(),
	],
};
