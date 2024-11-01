import { useEffect, useState } from "preact/hooks";
import { type ComponentChildren } from "preact";
// @ts-types="./types/css-modules.d.ts"
import styles from "./dropdown.module.css";

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
		<div class={styles.container} onClick={onClick}>
			<button>
				{props.button}
			</button>
			{open && (
				<div class={styles.drop}>
					{props.children}
				</div>
			)}
		</div>
	);
}
