// I really wish vite "just worked" with service workers designed for
// offline use, BUT the dev mode asset tree looks nothing like the prod
// asset tree, making offline caching strategies difficult to test in dev.
//
// Besides, I want to try out `rolldown` early...
import { rolldown, watch } from "rolldown";
import rollOpts, { dev } from "./config.ts";
import serveOpts from "./server.ts";

if (dev) {
	await watch(rollOpts);
	Deno.serve(serveOpts);
} else {
	const build = await rolldown(rollOpts);
	await build.write(rollOpts.output);
}
