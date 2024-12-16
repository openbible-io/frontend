import plugin from "tailwindcss/plugin";

// TODO: replace after tailwindcss picks native color-mix syntax:
// https://github.com/tailwindlabs/tailwindcss/discussions/14827
export default plugin(({ matchUtilities, theme }) => {
	matchUtilities(
		{
			"bg-mix": (value) => {
				let color = value;
				let amount = '';
				const split = value.split("/");
				if (split.length == 2) {
					color = split[0].trim();
					amount = split[1].trim() + '%';
				}

				return {
					background: `color-mix(in oklab, var(--color-bg), var(--color-${color}) ${amount})`,
				};
			},
		},
		{
			values: theme("backgroundColor"),
			type: "any", // "color" statically resolves to @theme instead of dynamic css variable
		}
	);
});
