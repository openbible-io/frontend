import "./app.css";
import { mount } from "svelte";
import App from "./app.svelte";
import langs from '../i18n/index.ts';

console.log(langs);

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;

		//"prosemirror-commands": "npm:prosemirror-commands@^1.6.2",
		//"prosemirror-history": "npm:prosemirror-history@^1.4.1",
		//"prosemirror-keymap": "npm:prosemirror-keymap@^1.2.2",
		//"prosemirror-model": "npm:prosemirror-model@^1.23.0",
		//"prosemirror-state": "npm:prosemirror-state@^1.4.3",
		//"prosemirror-view": "npm:prosemirror-view@^1.35.0",
