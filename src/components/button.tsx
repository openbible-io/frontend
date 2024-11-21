import type { JSX } from "preact";
import classes from "../lib/classnames.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
export default function Button(props: ButtonProps) {
	const { class: className, children, ...rest } = props;

	return (
		<button
			class={classes(
				"rounded-md p-1 m-1",
				"ring-1 ring-text/50",
				"hover:ring-text/80 hover:bg-primary/80",
				className,
			)}
			{...rest}
		>
			{children}
		</button>
	);
}
