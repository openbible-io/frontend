import { locales } from "../../shared/i18n.ts";
import * as store from "../stores/client.ts";
import type { WritableAtom } from "nanostores";
import { useStore } from "@nanostores/preact";
import Button from "./button.tsx";

export const i18n = store.i18n("settings", {
	theme: "Theme",
	system: "System",
	light: "Light",
	dark: "Dark",
	lang: "Language",
	reset: "Reset",
	username: "Username",
});

export default function Settings() {
	const t9n = useStore(i18n);

	return (
		<form
			onSubmit={(ev) => ev.preventDefault()}
			onReset={(ev) => {
				ev.preventDefault();
				store.theme.set(store.themes[0]);
				store.lang.set(store.locale);
			}}
			class="grid grid-cols-[33%_1fr] gap-y-2 break-all"
		>
			<Select
				name="theme"
				store={store.theme}
				options={store.themes.map((t) => [t, t9n[t]])}
			/>
			<Select
				name="lang"
				store={store.lang}
				options={locales.map((
					k,
				) => [k, new Intl.DisplayNames([k], { type: "language" }).of(k) ?? k])}
			/>
			<Input name="username" store={store.username} />
			<Button class="mt-4" type="reset">{t9n.reset}</Button>
		</form>
	);
}

interface SelectProps<T> {
	name: "theme" | "lang";
	store: WritableAtom<T>;
	options: ([T, string])[];
}
function Select<T extends string>(props: SelectProps<T>) {
	const t9n = useStore(i18n);
	const val = useStore(props.store);

	return (
		<>
			<label for={props.name}>
				{t9n[props.name]}
			</label>
			<select
				id={props.name}
				class="bg-inherit w-full"
				onChange={(ev) => props.store.set(ev.currentTarget.value as T)}
				value={val}
			>
				{props.options
					.map(([k, v]) => <option class="bg-bg" value={k}>{v}</option>)}
			</select>
		</>
	);
}

interface InputProps {
	name: "username";
	store: WritableAtom<string>;
}
function Input(props: InputProps) {
	const t9n = useStore(i18n);
	const val = useStore(props.store);

	return (
		<>
			<label for={props.name}>
				{t9n[props.name]}
			</label>
			<input
				id={props.name}
				class="bg-inherit w-full"
				onChange={(ev) => props.store.set(ev.currentTarget.value)}
				value={val}
			/>
		</>
	);
}
