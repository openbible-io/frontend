import type { JSX } from "preact";
import classnames from "../lib/classnames.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;
const Button = ({ class: className, ...rest }: ButtonProps) => (
	<button
		class={classnames(
			"rounded-md cursor-pointer",
			"hover:bg-mix-[text/30]",
			className,
		)}
		{...rest}
	/>
);

export default Button;

export const CloseButton = (props: ButtonProps) => (
	<Button {...props}>
		<div class="icon icon-[lucide--x]" />
	</Button>
);
