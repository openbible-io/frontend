import "./app.css";
import { mount } from "svelte";
import App from "./app.svelte";
import { initService } from "./workers.ts";

initService();

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;
