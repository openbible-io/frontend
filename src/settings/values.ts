import * as i18n from "@solid-primitives/i18n";
import { createContext, createResource, useContext } from 'solid-js';
import { useLocalStorage, useUserStyle } from '../reactivity';
import { index as languages } from '../i18n/index';
import * as controls from './controls';
import { fetchTranslator, defaultDict, Locale, navigatorLang } from '../i18n/ctx';

export const values = () => {
	const languageSignal = useLocalStorage<Locale>('language', navigatorLang(), {
		deserializer: s => {
			const v = JSON.parse(s);
			if (languages.includes(v)) return v;
			return navigatorLang();
		},
	});
	const t = createResource(languageSignal[0], fetchTranslator, {
		initialValue: i18n.translator(() => defaultDict)
	}); 

	return {
		ui: {
			language: {
				signal: languageSignal,
				Control: controls.select(languages),
				t,
			},
			text_color: {
				signal: useUserStyle('--primary-text-color'),
				Control: controls.Color,
			},
			font_family: {
				signal: useUserStyle('--primary-font-family'),
				Control: controls.String,
			},
			reader_font_family: {
				signal: useUserStyle('--reader-font-family'),
				Control: controls.String,
			},
			reader_font_size: {
				signal: useUserStyle('--reader-font-size'),
				Control: controls.length(['px']),
			},
		},
		content: {
			chapter_number_display: {
				signal: useUserStyle('--chapter-number-display'),
				Control: controls.checkbox('flex', 'none'),
			},
			chapter_number_hr_display: {
				signal: useUserStyle('--chapter-number-hr-display'),
				Control: controls.checkbox('block', 'none'),
			},
			chapter_first_letter_weight: {
				signal: useUserStyle('--chapter-first-letter-weight'),
				Control: controls.String,
			},
			chapter_first_letter_size: {
				signal: useUserStyle('--chapter-first-letter-size'),
				Control: controls.length([]),
			},
			h_display: {
				signal: useUserStyle('--h-display'),
				Control: controls.checkbox('block', 'none'),
			},
			sr_display: {
				signal: useUserStyle('--sr-display'),
				Control: controls.checkbox('block', 'none'),
			},
			verse_num_display: {
				signal: useUserStyle('--verse-num-display'),
				Control: controls.checkbox('inline', 'none'),
			},
			verse_num_user_select: {
				signal: useUserStyle('--verse-num-user-select'),
				Control: controls.checkbox('auto', 'none'),
			},
		},
	};
};

export const Context = createContext(undefined as unknown as ReturnType<typeof values>);

export function t() {
	const ctx = useContext(Context);
	return ctx.ui.language.t[0]();
}
