import { createSignal, onCleanup, createEffect, For, Show } from 'solid-js';
import { InnerHtml } from '../index';
import { SolidPlusIcon, SolidXIcon } from '../../icons/index';
import { ReaderNav } from './nav';
import { BibleInfos, VersionBookChapter, BookChapter, Books, bookNames, vbcEql, vbcUrl, bookChapters, nextBookChapter, BookId } from '../../bibles';
import styles from './reader.module.css';

const maxLoaded = 15;

export interface ReaderProps {
	vbc: VersionBookChapter;
	indices: BibleInfos;
	onAddReader?: () => void;
	onCloseReader?: () => void;
	onNavChange?: (chapter: VersionBookChapter) => void
	canClose?: boolean;
	class?: string;
};
export function Reader(props: ReaderProps) {
	const [vbcs, setVbcs] = createSignal([{
		vbc: props.vbc,
		loaded: false,
	}]);
	const [cur, setCur] = createSignal(props.vbc, { equals: vbcEql });
	createEffect(() => {
		if (props.onNavChange) props.onNavChange(cur());
	});
	const books = (version: string) => props.indices[version].books;
	function next(): VersionBookChapter | undefined {
		const chaps = vbcs();
		const last = chaps[chaps.length - 1];
		const res = nextBookChapter(last.vbc, props.indices[last.vbc.version].books, 1);
		if (res) return { version: last.vbc.version, ...res };
	}
	const isLoading = () => vbcs().some(v => !v.loaded);

	const container = (
		<div tabIndex={0} class={styles.content} onScroll={onScroll}>
			<div>
				<For each={vbcs()}>
					{c =>
						<>
							<ChapterHeading vbc={c.vbc} indices={props.indices} />
							<InnerHtml
								url={vbcUrl(c.vbc)}
								onSuccess={() => c.loaded = true}
								div={{ class: styles.reader }}
							/>
						</>
					}
				</For>
			</div>
			{/* Scrolling/overflow checking may not always be reliable in screen readers */}
			<Show when={next()}>
				<div class={styles.loadNext}>
					<ChapterHeading vbc={next()!} indices={props.indices} />
					<button
						onClick={() => setVbcs(old => [...old, { vbc: next()!, loaded: false }].slice(-maxLoaded))}
					>
						Load {bookNames[next()!.book]} {next()!.chapter}
						<link
							rel="prefetch"
							type="fetch"
							crossorigin="anonymous"
							href={vbcUrl(next()!)}
						/>
					</button>
				</div>
			</Show>
		</div>
	) as HTMLDivElement;

	let lastScroll = container.scrollTop;
	function onScroll() {
		// Update `cur`
		const chaps = vbcs();
		const target = container;
		const chapters = container.firstElementChild as HTMLDivElement;
		for (let i = chapters.children.length - 1; i >= 0 ; i--) {
			const c = chapters.children[i] as HTMLHeadingElement;
			const book = c.getAttribute('data-book');
			const chapter = c.getAttribute('data-chapter');

			if (book && chapter && c.offsetTop <= target.scrollTop) {
				const vbc: VersionBookChapter = {
					version: chaps[0].vbc.version,
					book: book as BookId,
					chapter: +chapter,
				};
				setCur(vbc);
				break;
			}
		}

		// If near top or bottom load previous/next chapter
		const scrollBottom = target.scrollTop + target.clientHeight;
		if (target.scrollHeight - scrollBottom < 500 && target.scrollTop > lastScroll) {
			const last = chaps[chaps.length - 1];
			if (!last.loaded) return;
			const next = nextBookChapter(last.vbc, props.indices[props.vbc.version].books, 1);
			if (!next) return;
			const vbc: VersionBookChapter = { version: last.vbc.version, ...next };
			setVbcs(existing => [...existing, { vbc, loaded: false }].slice(-maxLoaded));
		}

		if (target.scrollTop <= 300 && target.scrollTop < lastScroll) {
			const first = chaps[0];
			if (!first.loaded) return;
			const version = first.vbc.version;
			const newPrev = nextBookChapter(first.vbc, books(version), -1);
			if (!newPrev) return;
			const vbc: VersionBookChapter = { version: first.vbc.version, ...newPrev };
			setVbcs(existing => [{ vbc, loaded: false }, ...existing].slice(0, maxLoaded));
		}
		lastScroll = target.scrollTop;
	}
	const observer = new ResizeObserver(async () => {
		if (isOverflown(container) || isLoading()) return;
		// Load more so that onScroll interactions may load chapters.
		// How much more? Ideally we'd estimate based on the available height
		// and character count of each chapter. However, chapter lengths are
		// too costly to include in the index (1189 integers per version).
		//
		// So we pick 5 because that's around the max parallel HTTP requests
		// allowed per-origin by browsers. Their loading (or resizing this window)
		// will trigger this check again.
		const chaps = vbcs();
		const last = chaps[chaps.length - 1];
		const toLoad = nextN(last.vbc, books(last.vbc.version), 5)
			.map(vbc => ({ vbc: { version: last.vbc.version, ...vbc }, loaded: false }));
		setVbcs(existing => [...existing, ...toLoad].slice(-maxLoaded));
	});
	observer.observe(container);
	onCleanup(() => observer.disconnect());

	return (
		<article class={`${styles.article} ${props.class ?? ''}`}>
			<header>
				<ReaderNav
					chapter={cur()}
					indices={props.indices}
					onNavChange={vbc => {
						lastScroll = 0;
						setVbcs([{ vbc, loaded: false }]);
						setCur(vbc);
					}}
				/>
				<div style="flex: 1" />
				<span class={styles.windowButtons}>
					<button
						onClick={props.onAddReader}
						class={styles.windowButton}
					>
						<SolidPlusIcon height="1rem" width="1rem" />
					</button>
					<button
						onClick={props.onCloseReader}
						class={styles.windowButton}
						disabled={!props.canClose}
					>
						<SolidXIcon height="1rem" width="1rem" />
					</button>
				</span>
			</header>
			{container}
		</article>
	);
}

function isOverflown(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function nextN(bc: BookChapter, books: Books, n: number): BookChapter[] {
	const res: BookChapter[] = [];
	let next: BookChapter | undefined = bc;
	for (let i = 0; i < n; i++) {
		next = nextBookChapter(next, books, 1);
		if (next) {
			res.push(next);
		} else {
			break;
		}
	}
	return res;
}

interface ChapterHeadingProps {
	vbc: VersionBookChapter;
	indices: BibleInfos;
};
function ChapterHeading(props: ChapterHeadingProps) {
	const books = (version: string) => props.indices[version].books;
	const isFirst = () => props.vbc.chapter == bookChapters(books(props.vbc.version), props.vbc.book)[0];

	return (
		<>
			<Show when={isFirst()}>
				<h1 class={styles.bookTitle}>
					{bookNames[props.vbc.book]}
				</h1>
			</Show>
			<h2
				class={styles.chapterNumber}
				// For scroll spy
				data-book={props.vbc.book}
				data-chapter={props.vbc.chapter}
			>
				Chapter {props.vbc.chapter}
			</h2>
		</>
	);
}
