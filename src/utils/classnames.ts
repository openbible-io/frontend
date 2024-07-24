export function classnames(...args: (string | false | undefined)[]): string {
	return Array.prototype.slice.call(args).filter(Boolean).join(' ')
}