import type { JSX, RefObject } from "preact";
import classnames from "../lib/classnames.ts";
import { useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
	autoOpen?: boolean;
	position: "left" | "right";
}
export default forwardRef<HTMLDivElement, Props>(
	({ class: className, position, autoOpen = false, ...rest }, ref) => {
		ref = ref || useRef<HTMLDivElement>(null);

		useEffect(() => {
			const r = ref as RefObject<HTMLDivElement>;
			if (autoOpen && r.current) r.current.showPopover();
		}, []);

		return (
			<div
				ref={ref}
				popover={autoOpen ? "manual" : "auto"}
				class={classnames(
					"drawer",
					"w-screen h-screen md:w-96",
					"m-0 p-2 md:p-4 rounded-lg drop-shadow-2xl",
					"bg-bg/10",
					"absolute",
					position == "right"
						? "[--dir:1] ltr:left-auto  rtl:right-auto ltr:right-0 rtl:left-0"
						: "[--dir:-1] ltr:right-auto rtl:left-auto ltr:left-0 rtl:right-0",
					"text-text",
					"open:flex flex-col",
					className,
				)}
				{...rest}
			/>
		);
	},
);
