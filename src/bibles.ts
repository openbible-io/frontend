export const bookNames = {
	'gen': 'Genesis',
	'exo': 'Exodus',
	'lev': 'Leviticus',
	'num': 'Numbers',
	'deu': 'Deuteronomy',
	'jos': 'Joshua',
	'jdg': 'Judges',
	'rut': 'Ruth',
	'1sa': '1 Samuel',
	'2sa': '2 Samuel',
	'1ki': '1 Kings',
	'2ki': '2 Kings',
	'1ch': '1 Chronicles',
	'2ch': '2 Chronicles',
	'ezr': 'Ezra',
	'neh': 'Nehamiah',
	'est': 'Esther',
	'job': 'Job',
	'psa': 'Psalm',
	'pro': 'Proverbs',
	'ecc': 'Ecclessiates',
	'sng': 'Song of Solomon',
	'isa': 'Isiah',
	'jer': 'Jeremiah',
	'lam': 'Lamentations',
	'ezk': 'Ezekiel',
	'dan': 'Daniel',
	'hos': 'Hosea',
	'jol': 'Joel',
	'amo': 'Amos',
	'oba': 'Obadiah',
	'jon': 'Jonah',
	'mic': 'Micah',
	'nam': 'Nahum',
	'hab': 'Habakkuk',
	'zep': 'Zephaniah',
	'hag': 'Haggai',
	'zec': 'Zechariah',
	'mal': 'Malachi',
	'mat': 'Matthew',
	'mrk': 'Mark',
	'luk': 'Luke',
	'jhn': 'John',
	'act': 'Acts',
	'rom': 'Romans',
	'1co': '1 Corinthians',
	'2co': '2 Corinthians',
	'gal': 'Galatians',
	'eph': 'Ephesians',
	'php': 'Philippians',
	'col': 'Colossians',
	'1th': '1 Thessalonians',
	'2th': '2 Thessalonians',
	'1ti': '1 Timothy',
	'2ti': '2 Timothy',
	'tit': 'Titus',
	'phm': 'Philemon',
	'heb': 'Hebrews',
	'jas': 'James',
	'1pe': '1 Peter',
	'2pe': '2 Peter',
	'1jn': '1 John',
	'2jn': '2 John',
	'3jn': '3 John',
	'jud': 'Jude',
	'rev': 'Revelation',
};
export type BookId = keyof typeof bookNames;

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

export function infoAboutUrl(bi: BibleInfo) {
	return `${base}/bibles/${bi.version}/${bi.about}.html`;
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
	return a?.chapter == b?.chapter && a?.chapter == b?.chapter && a?.version == b?.version;
}
