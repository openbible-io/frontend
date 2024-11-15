import sharedInit, { type TableSchema, type ValueSchema } from "./shared.ts";
import { createLocalPersister } from "tinybase/persisters/persister-browser/with-schemas";
import langs, { Language } from "../../shared/i18n.ts";
import {
	useCreateQueries as useCreateQueries0,
	useTable as useTable0,
	useValue as useValue0,
} from "tinybase/ui-react";
import type { WithSchemas } from "tinybase/ui-react/with-schemas";
import type { Queries } from "tinybase/queries/with-schemas";
import type { Store } from "tinybase/with-schemas";

type Schema = [TableSchema, ValueSchema];
type UiReactWithSchemas = WithSchemas<Schema>;

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
	const persister = createLocalPersister(res, "shared");
	await persister.load([{}, { lang: getLang(), theme: "device" }]);
	await persister.startAutoSave();
	res.merge(sharedInit());
	return res;
}

const store: Store<Schema> = await init();
export default store;

export function useValue(key: keyof ValueSchema) {
	return (useValue0 as UiReactWithSchemas["useValue"])(key, store);
}

export function useTable(key: keyof TableSchema) {
	return (useTable0 as UiReactWithSchemas["useTable"])(key, store);
}

export function useCreateQueries(
	create: (s: Store<Schema>) => Queries<Schema>,
) {
	return (useCreateQueries0 as unknown as UiReactWithSchemas[
		"useCreateQueries"
	])(store, create);
}
