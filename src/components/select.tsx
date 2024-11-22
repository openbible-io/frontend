import type { JSX } from "preact";
import classnames from "../lib/classnames.ts";
import { classes } from "./input.tsx";

export type NativeProps = JSX.HTMLAttributes<HTMLSelectElement>;
export function Native({ class: className, ...rest }: NativeProps) {
	return (
		<select
			class={classnames(
				"bg-inherit",
				classes,
				className,
			)}
			{...rest}
		/>
	);
}
