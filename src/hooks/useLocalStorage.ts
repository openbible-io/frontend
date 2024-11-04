import {
	type Dispatch,
	type StateUpdater,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";

type Options<T> = Partial<{
	serializer: (object: T | undefined) => string;
	parser: (val: string) => T | undefined;
}>;
export default function useLocalStorage<T>(
	key: string,
	defaultValue?: T,
	options?: Options<T>,
): [T | undefined, Dispatch<StateUpdater<T | undefined>>] {
	const opts = useMemo(() => {
		return {
			serializer: JSON.stringify,
			parser: JSON.parse,
			logger: console.log,
			...options,
		};
	}, [options]);

	const { serializer, parser, logger } = opts;

	const rawValueRef = useRef<string | null>(null);

	const [value, setValue] = useState(() => {
		if (typeof window === "undefined") return defaultValue;

		try {
			rawValueRef.current = localStorage.getItem(key);
			const res: T = rawValueRef.current
				? parser(rawValueRef.current)
				: defaultValue;
			return res;
		} catch (e) {
			logger(e);
			return defaultValue;
		}
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			if (value !== undefined) {
				const newValue = serializer(value);
				rawValueRef.current = newValue;
				localStorage.setItem(key, newValue);
			} else {
				localStorage.removeItem(key);
			}
		} catch (e) {
			logger(e);
		}
	}, [value]);

	return [value, setValue];
}
