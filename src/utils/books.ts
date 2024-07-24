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

export class BibleIndex {
	constructor (
		public version: string,
		public publisher: string,
		public title: string,
		public date: string,
		public modified: string,
		public license: string,
		public authors: string[],
		public books: {
			[book in BookId]: number | number[]; // chapters 1-number or number[]
		},
		public about?: string,
	) {}

	static fromJson(version: string, json: BibleIndex): BibleIndex {
		return new BibleIndex(
			version,
			json.publisher,
			json.title,
			json.date,
			json.modified,
			json.license,
			json.authors,
			json.books,
			json.about,
		);
	}

	chapters(book: BookId): number[] {
		const nChaptersOrChapters = this.books[book] ?? 0;
		if (Array.isArray(nChaptersOrChapters)) return nChaptersOrChapters;

		return Array.from({ length: nChaptersOrChapters }, (_, i) => i + 1);
	}

	async fetchAboutHtml(): Promise<string> {
		if (!this.about) return 'No foreword';
		const url = `${import.meta.env['OPENBIBLE_STATIC_URL']}/bibles/${this.version}/${this.about}.html`;
		return fetchHtml(url);
	}
};
export type BibleIndices = { [version: string]: BibleIndex };
export class BibleChapter {
	constructor(
		public version: string,
		public book: BookId,
		public chapter: number,
	) {}

	static fromJson(json: BibleChapter): BibleChapter {
		return new BibleChapter(json.version, json.book, json.chapter);
	}

	static first(indices: BibleIndices, version: string, book: BookId): BibleChapter {
		const firstChapter = indices[version].chapters(book)[0];
		return new BibleChapter(version, book, firstChapter);
	}

	static eql(a?: BibleChapter, b?: BibleChapter): boolean {
		if (a == undefined && b == undefined) return true;
		if (a == undefined || b == undefined) return false;
		return a.version == b.version && a.book == b.book && a.chapter == b.chapter;
	}

	isFirst(indices: BibleIndices): boolean {
		const firstChapter = indices[this.version].chapters(this.book)[0];
		return this.chapter == firstChapter;
	}

	next(indices: BibleIndices, n: number): BibleChapter | undefined {
		const index = indices[this.version];
		if (!index) return;
		const chapters = index.chapters(this.book);
		const chapterI = chapters.indexOf(this.chapter);
		const books = Object.keys(index.books);
		const bookI = books.indexOf(this.book);
		if (bookI == -1 || chapterI == -1) return;

		let nextBook = this.book;
		let nextChapter = chapters[chapterI + n];
		if (!nextChapter) {
			nextBook = books[bookI + n] as BookId;
			if (nextBook) {
				const newChapters = index.chapters(nextBook);
				nextChapter = n > 0 ? newChapters[0] : newChapters[newChapters.length - 1];
			}
		}

		if (!nextBook || !nextChapter) return;
		return new BibleChapter(this.version, nextBook, nextChapter);
	}

	htmlUrl(): string {
		const chap = (this.chapter + '').padStart(3, '0');
		return `${import.meta.env['OPENBIBLE_STATIC_URL']}/bibles/${this.version}/${this.book}/${chap}.html`;
	}

	async fetchHtml(): Promise<string> {
		const url = this.htmlUrl();
		const res = await fetch(url);
		if (res.ok) return res.text();

		throw new Error(res.status + '\n' + url);
	}
}

export async function fetchHtml(url: string): Promise<string> {
	return fetch(url)
		.then(res => {
			if (res.ok) return res.text();
			return res.status + '\n' + url;
		})
		.catch(e => `<pre>${e.stack}</pre>`);
}
