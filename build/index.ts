// I really wish vite "just worked" with service workers designed for
// offline use, BUT:
// - The dev mode asset tree looks nothing like the prod asset tree, making
// offline caching strategies difficult to test in dev.
// - Registering the service worker under `/` requires multiple config options
// and a magic `?worker&url` import suffix.
//
// For these reasons we write build scripts.
import { rolldown, watch } from "rolldown";
import rollOpts, { dev } from './config.ts';
import serveOpts from './server.ts';

if (dev) {
	await watch(rollOpts);
	Deno.serve(serveOpts);
} else {
	const build = await rolldown(rollOpts);
	await build.write(rollOpts.output);
}
