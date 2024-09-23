export type BookId =
	'gen' | 'exo' | 'lev' | 'num' | 'deu' | 'jos' | 'jdg' | 'rut' | '1sa' | '2sa' | '1ki' |
	'2ki' | '1ch' | '2ch' | 'ezr' | 'neh' | 'est' | 'job' | 'psa' | 'pro' | 'ecc' | 'sng' |
	'isa' | 'jer' | 'lam' | 'ezk' | 'dan' | 'hos' | 'jol' | 'amo' | 'oba' | 'jon' | 'mic' |
	'nam' | 'hab' | 'zep' | 'hag' | 'zec' | 'mal' | 'mat' | 'mrk' | 'luk' | 'jhn' | 'act' |
	'rom' | '1co' | '2co' | 'gal' | 'eph' | 'php' | 'col' | '1th' | '2th' | '1ti' | '2ti' |
	'tit' | 'phm' | 'heb' | 'jas' | '1pe' | '2pe' | '1jn' | '2jn' | '3jn' | 'jud' | 'rev'
;

export type Books = {
	[book in BookId]: number | number[]; // chapters 1-number or number[]
};
// See openbible-io:static/build.js
export type BibleInfo = {
	downloadUrl?: string;
	title: string,
	publisher: string,
	publisherUrl?: string,
	repo: string,
	modified: string,
	license: string,
	licenseUrl?: string,
	authors?: string[],
	books: Books,
	about?: string,
};

export function bookChapters(books: Books, book: BookId): number[] {
	const nChaptersOrChapters = books[book] ?? 0;
	if (Array.isArray(nChaptersOrChapters)) return nChaptersOrChapters;

	return Array.from({ length: nChaptersOrChapters }, (_, i) => i + 1);
}

export type BibleInfos = { [version: string]: BibleInfo };
export type BookChapter = {
	book: BookId,
	chapter: number,
};
export interface VersionBookChapter extends BookChapter {
	version: string,
};

export function nextBookChapter(bc: BookChapter, books: Books, n: number): BookChapter | undefined {
	const chapters = bookChapters(books, bc.book);
	const chapterI = chapters.indexOf(bc.chapter);
	const bookz = Object.keys(books);
	const bookI = bookz.indexOf(bc.book);
	if (bookI == -1 || chapterI == -1) return;

	let book = bc.book;
	let chapter = chapters[chapterI + n];
	if (!chapter) {
		book = bookz[bookI + n] as BookId;
		if (!book) return;

		const newChapters = bookChapters(books, book);
		chapter = n > 0 ? newChapters[0] : newChapters[newChapters.length - 1];
	}

	return { book, chapter };
}

const base = import.meta.env['OPENBIBLE_STATIC_URL'];
export const infosUrl = `${base}/bibles/index.json`;

export function infoAboutUrl(version: string, bi: BibleInfo) {
	return `${base}/bibles/${version}/${bi.about}.html`;
}

export function vbcUrl(vbc: VersionBookChapter) {
	const chap = (vbc.chapter + '').padStart(3, '0');
	return `${base}/bibles/${vbc.version}/${vbc.book}/${chap}.html`;
}

export function bcString(bc: BookChapter, books: Books): string {
	const bookN = Object.keys(books).indexOf(bc.book) + 1;
	return `${bookN.toString().padStart(2, '0')}${bc.book}${bc.chapter}`;
}

export function vbcString(vbc: VersionBookChapter, books: Books) {
	return `${vbc.version}-${bcString(vbc, books)}`;
}

export function bcEql(a: BookChapter, b?: BookChapter) {
	return a.chapter == b?.chapter && a.chapter == b?.chapter;
}

export function vbcEql(a?: VersionBookChapter, b?: VersionBookChapter) {
	return a?.book == b?.book && a?.chapter == b?.chapter && a?.version == b?.version;
}
