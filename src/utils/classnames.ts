export function classnames(...args: (string | boolean | null | undefined)[]): string {
	return Array.prototype.slice.call(args).filter(Boolean).join(' ')
}
