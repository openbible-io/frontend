import { useEffect, useState } from "preact/hooks";
import { type ComponentChildren } from "preact";

interface DropdownProps {
	button: ComponentChildren;
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
		<div class="relative inline-block" onClick={onClick}>
			<button>
				{props.button}
			</button>
			{open && (
				<div class="absolute z-10">
					{props.children}
				</div>
			)}
		</div>
	);
}
