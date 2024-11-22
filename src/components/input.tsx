import type { JSX } from "preact";
import classnames from "../lib/classnames.ts";

export const classes = classnames(
	"px-3 bg-inherit",
	"border rounded border-text border-mix-bg border-mix-amount-20",
);

export type Props = JSX.HTMLAttributes<HTMLInputElement>;
export default function Input({ class: className, ...rest }: Props) {
	return (
		<input
			class={classnames(
				classes,
				className,
			)}
			{...rest}
		/>
	);
}
