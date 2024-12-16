import type { JSX } from "preact";
import { twMerge } from 'tailwind-merge'

export default function classnames(
	...classes: (JSX.HTMLAttributes["class"] | boolean | undefined | null)[]
) {
	return twMerge(classes.filter(Boolean).join(" ") ?? "");
}
