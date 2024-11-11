import type { JSX } from "preact";

export default function classnames(...classes: JSX.HTMLAttributes["class"][]) {
	return classes.filter(Boolean).join(" ") ?? null;
}
