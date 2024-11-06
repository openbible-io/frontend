import { execSync } from "node:child_process";

const tagCmd = "git describe --tags --match=v[0-9]*.[0-9]*.[0-9]*";
const stdio = [
	"ignore", // stdin
	"pipe", // stdout
	"ignore", // stderr
];

function hasUnstaged() {
	try {
		const unstaged = execSync(`git status --porcelain=v1`);
		return Boolean(unstaged.toString().trim().length);
	} catch {
		return false;
	}
}

export function getVersion() {
	if (hasUnstaged()) return "dev";
	try {
		return execSync(tagCmd + " --abbrev=0 --exact-match", { stdio }).toString()
			.trim();
	} catch {
		return "dev";
	}
}

export function getVersionDate() {
	if (getVersion() == "dev") return new Date().toISOString().substring(0, 10);
	const date = execSync(
		`git show --no-patch --format=%cd --date=format:'%Y-%m-%d'`,
		{ stdio },
	);
	return date.toString().trim();
}

console.log({
	hasUnstaged: hasUnstaged(),
	getVersion: getVersion(),
	getVersionDate: getVersionDate(),
});
