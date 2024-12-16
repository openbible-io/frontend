import { useEffect, useState } from "preact/hooks";
import { type ComponentChildren } from "preact";
import Button, { type ButtonProps } from "./button.tsx";
import classnames from "../lib/classnames.ts";

interface DropdownProps {
	button: ButtonProps;
	class?: string;
	children: ComponentChildren;
}
export default function Dropdown(props: DropdownProps) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const close = () => setOpen(false);
		document.addEventListener("click", close);

		return () => document.removeEventListener("click", close);
	}, []);

	function onClick(ev: MouseEvent) {
		setOpen(!open);
		ev.stopPropagation();
	}

	return (
		<div
			class={classnames("relative", "inline-block", props.class)}
			onClick={onClick}
		>
			<Button {...props.button} />
			{open && (
				<div class="absolute z-10">
					{props.children}
				</div>
			)}
		</div>
	);
}
