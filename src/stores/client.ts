import sharedInit, { defaultTables, type TableSchema, type ValueSchema } from "./shared.ts";
import { createLocalPersister } from "tinybase/persisters/persister-browser/with-schemas";
import langs, { Language } from "../../shared/i18n.ts";
import {
	useTable as useTable0,
	useValue as useValue0,
} from "tinybase/ui-react";
import { WithSchemas } from "tinybase/ui-react/with-schemas";

type UiReactWithSchemas = WithSchemas<
	[TableSchema, ValueSchema]
>;

function getLang(): Language {
	for (const e of Object.entries(langs)) {
		const [id, { test }] = e;
		if (test.test(navigator.language)) return id as Language;
	}

	return Object.keys(langs)[0] as Language;
}

// Persisted to localstorage for before service worker is loaded
// to prevent a FOUC.
async function init() {
	const res = sharedInit();
	const persister = createLocalPersister(res, "sharedStore");
	await persister.load([defaultTables(), { lang: getLang(), theme: "device" }]);
	await persister.startAutoSave();
	return res;
}

const store = await init();
export default store;

export function useValue(key: keyof ValueSchema) {
	return (useValue0 as UiReactWithSchemas["useValue"])(key, store);
}

export function useTable(key: keyof TableSchema) {
	return (useTable0 as UiReactWithSchemas["useTable"])(key, store);
}
