// I really wish vite "just worked" with service workers designed for
// offline use, BUT the dev mode asset tree looks nothing like the prod
// asset tree, making offline caching strategies difficult to test in dev.
import { rolldown, watch } from "rolldown";
import rollOpts, { dev } from "./config.ts";
import serveOpts, { emitter } from "./server.ts";
import process from "node:process";

if (dev) {
	const watchers = rollOpts.map((o) => watch(o));
	watchers.forEach((w) =>
		w.on("event", (ev) => {
			let msg = "";
			if (ev.code == "BUNDLE_START") {
				msg = "bundling...";
			} else if (ev.code == "BUNDLE_END") {
				msg = `bundled in ${ev.duration}ms`;
				emitter.change();
			} else if (ev.code == "ERROR") {
				msg = ev.error.message;
				emitter.error(ev.error.message);
			}
			if (msg) {
				const date = new Date().toLocaleTimeString();
				process.stderr.write(`[${date}] ${msg}\n`);
			}
		})
	);
	Deno.serve(serveOpts);
} else {
	await Promise.all(rollOpts.map(async (o) => {
		const builder = await rolldown(o);
		await builder.write(o.output!);
	}));
}
