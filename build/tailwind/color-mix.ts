import plugin from "tailwindcss/plugin";

export default
	plugin(({ matchUtilities, theme, corePlugins }) => {
		// add bg-mix utility
		console.log(theme, theme("backgroundColor"));
		//matchUtilities(
		//	{
		//		[bgMix]: (value) => {
		//			const { mixColor, ...rest } = withAlphaVariable({
		//				color: value,
		//				property: "mixColor",
		//				variable: "--tw-bg-mix-opacity",
		//			});
		//
		//			return {
		//				"background-color":
		//					`color-mix(in oklch, ${mixColor} calc(var(--tw-bg-mix-amount, 0) * 1%), var(--tw-bg-base))`,
		//			};
		//		},
		//	},
		//	{
		//		values: flattenColorPalette(theme("backgroundColor")),
		//		type: ["color", "any"],
		//	},
		//);

		// add bg-mix-amount utility
		//matchUtilities(
		//	{
		//		[bgMixAmount]: (value) => ({
		//			"--tw-bg-mix-amount": value,
		//		}),
		//	},
		//	{
		//		values: Object.fromEntries(
		//			Object.entries(theme("backgroundOpacity")).map(([key, value]) => [
		//				key,
		//				`${value * 100}`,
		//			]),
		//		),
		//	},
		//);

		//// add bg-mix-space utility
		//matchUtilities(
		//	{
		//		[bgMixMethod]: (value) => ({
		//			"--tw-bg-mix-method": value,
		//		}),
		//	},
		//	{
		//		values: {
		//			srgb: "in srgb",
		//			"shorter-hue": "in hsl shorter hue",
		//			"longer-hue": "in hsl longer hue",
		//		},
		//	},
		//);
		//
		//// add --tw-bg-base to bg-utility
		//matchUtilities(
		//	{
		//		bg: (value) => {
		//			if (!corePlugins("backgroundOpacity")) {
		//				return {
		//					"background-color": toColorValue(value),
		//				};
		//			}
		//
		//			return withAlphaVariable({
		//				color: value,
		//				property: "--tw-bg-base",
		//				variable: "--tw-bg-opacity",
		//			});
		//		},
		//	},
		//	{
		//		values: flattenColorPalette(theme("backgroundColor")),
		//		type: ["color", "any"],
		//	},
		//);
	});
