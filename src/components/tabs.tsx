import { createEffect, createSignal, For, JSX } from 'solid-js';
interface TabsProps {
	index?: number;
	onSelect?: (newIndex: number) => void;
	options: [JSX.Element, JSX.Element][];
};
export function Tabs(props: TabsProps) {
	const [index, setIndex] = createSignal(props.index ?? 0);
	createEffect(() => props.onSelect?.(index()));

	return (
		<div>
			<For each={props.options}>
				{(opt, i) => 
					<button onClick={() => setIndex(i())}>
						{opt[0]}
					</button>
				}
			</For>
			{props.options[index()][1]}
		</div>
	);
}
