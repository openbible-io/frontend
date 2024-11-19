import { type Locale, locales } from "../../shared/i18n.ts";
import * as store from "../stores/client.ts";
import { useStore } from "@nanostores/preact";

export const i18n = store.i18n("settings", {
	system: "System",
	light: "Light",
	dark: "Dark",
});

export default function Settings() {
	const theme = useStore(store.theme);
	const lang = useStore(store.lang);
	const t9n = useStore(i18n);

	return (
		<>
			<select
				onChange={(ev) =>
					store.theme.set(ev.currentTarget.value as store.Theme)}
				value={theme}
			>
				{store.themes.map((t) => <option value={t}>{t9n[t]}</option>)}
			</select>
			<select
				onChange={(ev) => store.lang.set(ev.currentTarget.value as Locale)}
				value={lang}
			>
				{locales.map((k) => (
					<option value={k}>
						{new Intl.DisplayNames([k], { type: "language" }).of(k)}
					</option>
				))}
			</select>
		</>
	);
}
