import type { JSX, RefObject } from "preact";
import classnames from "../lib/classnames.ts";
import { useEffect, useRef } from "preact/hooks";
import { forwardRef } from "preact/compat";

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
	autoOpen?: boolean;
	position: "left" | "right";
	animate?: boolean;
	backdrop?: boolean;
}
export default forwardRef<HTMLDivElement, Props>(
	(
		{
			class: className,
			position,
			autoOpen = false,
			animate,
			backdrop,
			...rest
		},
		ref,
	) => {
		ref = ref || useRef<HTMLDivElement>(null);

		useEffect(() => {
			const r = ref as RefObject<HTMLDivElement>;
			if (autoOpen && r.current) r.current.showPopover();
		}, []);

		const animateClasses = animate && classnames(
			// Animate opacity
			"opacity-0",
			"open:opacity-100 starting:open:opacity-0",
			// Animate translation
			"translate-x-[calc(var(--dir)*100%)]",
			"open:translate-x-0 starting:open:translate-x-[calc(var(--dir)*100%)]",
		);

		const backdropClasses = backdrop && classnames(
			animate && "backdrop:duration-(--duration-in)",
			"open:backdrop:bg-bg/40 starting:open:backdrop:bg-transparent",
		);

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
						? "[--dir:1] rtl:[--dir:-1] ltr:left-auto  rtl:right-auto ltr:right-0 rtl:left-0"
						: "[--dir:-1] rtl:[--dir:1]",
					animate && "[--duration-in:0.5s] [--duration-out:0.3s]",
					"transition-discrete duration-(--duration-out) open:duration-(--duration-in)",
					animateClasses,
					backdropClasses,
					"text-text",
					"open:flex flex-col",
					className,
				)}
				{...rest}
			/>
		);
	},
);
