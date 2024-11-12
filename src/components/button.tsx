import type { JSX } from 'preact';
import classes from "../lib/classnames.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
export default function Button(props: ButtonProps) {
	const { class: className, children, ...rest } = props;

	return (
		<button class={classes("bg-pink-50", className)} {...rest}>
			{children}
		</button>
	);
}
