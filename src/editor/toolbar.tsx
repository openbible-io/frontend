import type { EditorView } from "prosemirror-view";
import type { Command } from "prosemirror-state";
import { h } from "preact";
import { setBlockType, toggleMark, wrapIn } from "prosemirror-commands";
import { schema } from "./document.ts";
import Dropdown from "../dropdown.tsx";

const logState: Command = (_, __, view) => {
	console.log(view);
	return true;
};

interface ToolbarProps {
	view: EditorView | undefined;
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
			<Dropdown button={<div style={{ width: "5em" }}>Block type</div>}>
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
						<button
							onClick={() =>
								doCommand(setBlockType(schema.nodes.heading, { level }))}
						>
							{h(Ele, {}, Ele)}
						</button>
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
