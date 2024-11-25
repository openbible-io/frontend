import type { JSX } from "preact";
import classes from "../lib/classnames.ts";
import classnames from "../lib/classnames.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
export default ({ class: className, ...rest }: ButtonProps) => (
	<button
		class={classes(
			"rounded-md p-1 cursor-pointer",
			"ring-1 ring-text/50",
			"hover:ring-text/80 hover:bg-primary/80",
			className,
		)}
		{...rest}
	/>
);

export const CloseButton = ({ class: className, ...rest }: ButtonProps) => (
	<button
		class={classnames(
			"rounded-lg bg-bg bg-mix-text hover:bg-mix-amount-10 cursor-pointer",
			className,
		)}
		{...rest}
	>
		<div class="icon icon-[lucide--x]" />
	</button>
);
