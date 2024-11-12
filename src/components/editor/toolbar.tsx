import type { EditorView } from "prosemirror-view";
import type { Command } from "prosemirror-state";
import { h } from "preact";
import { setBlockType, toggleMark, wrapIn } from "prosemirror-commands";
import { schema } from "../../lib/document.ts";
import Dropdown from "../dropdown.tsx";
import Button from "../button.tsx";

const logState: Command = (_, __, view) => {
	console.log(view);
	return true;
};

interface ToolbarProps {
	view?: EditorView;
}
export default function Toolbar(props: ToolbarProps) {
	const cmds = [
		{ icon: <b>B</b>, cmd: toggleMark(schema.marks.strong) },
		{ icon: <i>i</i>, cmd: toggleMark(schema.marks.em) },
		{ icon: ">", cmd: wrapIn(schema.nodes.blockquote) },
	];

	function doCommand(c: Command) {
		if (props.view) c(props.view.state, props.view.dispatch, props.view);
	}

	return (
		<div>
			{cmds.map((c) => (
				<button onClick={() => doCommand(c.cmd)}>
					{c.icon}
				</button>
			))}
			<Dropdown button={{ children: "Block type" }}>
				{[...Array(8).keys()].map((i) => {
					const level = i + 1;
					const Ele = "h" + level as
						| "h1"
						| "h2"
						| "h3"
						| "h4"
						| "h5"
						| "h6"
						| "h7"
						| "h8";
					return (
						<Button
							onClick={() =>
								doCommand(setBlockType(schema.nodes.heading, { level }))}
						>
							{h(Ele, {}, Ele)}
						</Button>
					);
				})}
			</Dropdown>
			{import.meta.env.DEV && (
				<button onClick={() => doCommand(logState)}>
					Log state
				</button>
			)}
		</div>
	);
}
