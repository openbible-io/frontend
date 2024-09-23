import { JSX, createSignal, createUniqueId } from 'solid-js';
import styles from './dropdown.module.css';

export interface DropdownProps {
	button: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
	div: JSX.HTMLAttributes<HTMLDivElement>;
	widthPx: number;
};
export function Dropdown(props: DropdownProps) {
	const [button, setButton] = createSignal<HTMLButtonElement>();
	const id = createUniqueId();
	const div = (
		<div
			{...props.div}
			id={id}
			class={`${props.div.class ?? ''} ${styles.popover}`}
			style={{ width: `${props.widthPx}px` }}
			popover
			onBeforeToggle={ev => {
				const b = button();
				const d = ev.target;
				if (!b || !d) return;
				const { x, y, height } = b.getBoundingClientRect();
				const left = (x + props.widthPx > window.innerWidth) ? window.innerWidth - props.widthPx : x;
				d.style.left = `${left}px`;
				d.style.top = `${y + height}px`;
			}}
		/>
	) as HTMLDivElement;

	return (
		<>
			<button
				{...props.button}
				ref={setButton}
				popoverTarget={id}
			/>
			{div}
		</>
	);
}
