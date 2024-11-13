// I really wish vite "just worked" with service workers designed for
// offline use, BUT the dev mode asset tree looks nothing like the prod
// asset tree, making offline caching strategies difficult to test in dev.
import { rolldown, watch } from "rolldown";
import rollOpts, { dev } from "./config.ts";
import serveOpts, { emitter } from "./server.ts";
import process from "node:process";

if (dev) {
	const watcher = await watch(rollOpts);
	watcher.on("event", (ev) => {
		if (ev.code == "BUNDLE_START") {
			process.stdout.write(`[${new Date().toLocaleTimeString()}] bundling...`);
		} else if (ev.code == "BUNDLE_END") {
			console.log(` done in ${ev.duration}ms`);
		} else if (ev.code == "ERROR") {
			emitter.emit("error");
		}
	});
	Deno.serve(serveOpts);
} else {
	const build = await rolldown(rollOpts);
	await build.write(rollOpts.output);
}
