import { JSX, createEffect, createSignal, Switch, Match } from 'solid-js';

interface ControlProps<T> {
	id: string;
	getter: () => T;
	setter: (v: T) => void;
};
export type Control<T> = (props: ControlProps<T>) => JSX.Element;

export function String<T extends string>(props: ControlProps<T>) {
	return (
		<input id={props.id} value={props.getter()} onInput={ev => props.setter(ev.target.value as T)} />
	);
}

export function Color<T extends string>(props: ControlProps<T>) {
	return (
		<input
			id={props.id}
			type="color"
			value={props.getter()}
			onChange={ev => props.setter(ev.target.value as T)}
		/>
	);
}

export function select(options: readonly string[]) {
	return function Select<T extends string>(props: ControlProps<T>) {
		return (
			<select id={props.id} value={props.getter()} onChange={ev => props.setter(ev.target.value as T)}>
				{options.map(o => <option>{o}</option>)}
			</select>
		);
	}
}

export function length(suffixes: readonly string[]) {
	return function Length<T extends string>(props: ControlProps<T>) {
		const [prefix, setPrefix] = createSignal(Number.parseFloat(props.getter()));
		const [suffix, setSuffix] = createSignal(props.getter().replace(prefix().toString(), ''));

		createEffect(() => props.setter(`${prefix()}${suffix()}` as T));

		return (
			<>
				<input
					id={props.id}
					type="number"
					value={prefix()}
					onChange={ev => setPrefix(+ev.target.value)}
					min={0}
				/>
				<Switch>
					<Match when={suffixes.length == 0}>
						<input value={suffix()} onChange={ev => setSuffix(ev.target.value)} />
					</Match>
					<Match when={suffixes.length == 1}>
						<span>{suffixes[0]}</span>
					</Match>
					<Match when={suffixes.length > 1}>
						<select onChange={ev => setSuffix(ev.target.value)}>
							{suffixes.map(s => <option>{s}</option>)}
						</select>
					</Match>
				</Switch>
			</>
		);
	};
}

export function checkbox(checkedValue: string, uncheckedValue: string) {
	return function Checkbox(props: ControlProps<string>) {
		return (
			<input
				id={props.id}
				type="checkbox"
				checked={props.getter() != uncheckedValue}
				onInput={ev => props.setter(ev.target.checked ? checkedValue : uncheckedValue)}
			/>
		);
	}
}
