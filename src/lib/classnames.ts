import type { JSX } from "preact";

export default function classnames(
	...classes: (JSX.HTMLAttributes["class"] | boolean | undefined | null)[]
) {
	return classes.filter(Boolean).join(" ") ?? "";
}
