import type { JSX } from "preact";
import classes from "../lib/classnames.ts";
import classnames from "../lib/classnames.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
const Button = ({ class: className, ...rest }: ButtonProps) => (
	<button
		class={classes(
			"rounded-md p-1 cursor-pointer",
			"ring-1 ring-text/50",
			"hover:ring-text/80 hover:bg-mix-[text/30]",
			className,
		)}
		{...rest}
	/>
);

export default Button;

export const CloseButton = ({ class: className, ...rest }: ButtonProps) => (
	<Button class={classnames("p-0", "ring-0", className)} {...rest}>
		<div class="icon icon-[lucide--x]" />
	</Button>
);
