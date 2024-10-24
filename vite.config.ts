import { defineConfig } from 'vite';
import deno from '@deno/vite-plugin';
import preact from '@preact/preset-vite';
import { execSync } from 'node:child_process';
import { env } from 'node:process';
import sources from './src/sources.ts';

const envPrefix = 'OPENBIBLE_';
function setEnv(key: string, value: string) {
	env[`${envPrefix}${key}`] = value;
}
function getCommit() {
	const sha = execSync(`git rev-parse HEAD`);
	return sha.toString().trim();
}
function getCommitDate() {
	const date = execSync(
		`git show --no-patch --format=%cd --date=format:'%Y-%m-%d'`,
	);
	return date.toString().trim();
}
setEnv('COMMIT', getCommit());
setEnv('COMMIT_DATE', getCommitDate());
setEnv(
	'VERSIONS_HTML',
	Object.values(sources)
		.map(({ title, url }) => `<li><a href="${url}">${title}</a></li>`)
		.join(''),
);

export default defineConfig({
	plugins: [deno(), preact()],
	build: {
		target: 'esnext',
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					if (id.includes('node_modules')) return 'vendor';
				},
			},
		},
	},
	envPrefix,
});
