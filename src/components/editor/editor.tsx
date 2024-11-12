import type { Node } from "prosemirror-model";
import { useEffect, useRef, useState } from "preact/hooks";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { schema } from "../../lib/document.ts";
import Toolbar from "./toolbar.tsx";
import "prosemirror-view/style/prosemirror.css"; // TODO: CSS module

interface EditorProps {
	toolbar: boolean;
	document?: Node;
}
export default function Editor(props: EditorProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [view, setView] = useState<EditorView>();

	useEffect(() => {
		if (!ref.current) return;

		const state = EditorState.create({
			doc: props.document,
			schema,
			plugins: [
				history(),
				keymap({ "Mod-z": undo, "Mod-y": redo, "Ctrl-Shift-z": redo }),
				keymap(baseKeymap),
			],
		});
		const newView = new EditorView({ mount: ref.current }, { state });
		setView(newView);
		setTimeout(() => newView.focus());

		return () => newView.destroy();
	}, [ref]);

	return (
		<>
			{props.toolbar && <Toolbar view={view} />}
			<div ref={ref} />
		</>
	);
}
