import { createSignal, onCleanup, createEffect, For, createMemo } from 'solid-js';
import { InnerHtml } from '../index';
import { SolidPlusIcon, SolidXIcon } from '../../icons/index';
import { ReaderNav } from './nav';
import { BibleInfos, VersionBookChapter, BookId, BookChapter, Books, bookNames, bcEql, vbcEql, vbcUrl, bookChapters, nextBookChapter } from '../../bibles';
import styles from './reader.module.css';

const maxLoaded = 50;

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
	const [prev, setPrev] = createSignal<VersionBookChapter | undefined>(undefined, { equals: vbcEql });
	const [cur, setCur] = createSignal(props.vbc, { equals: vbcEql });
	const books = (version: string) => props.indices[version].books;

	createEffect(() => {
		const vbc = prev();
		if (!vbc) return;
		console.log('hello', vbc);
		setVbcs(existing => [{ vbc, loaded: false }, ...existing]);
	});
	const container = (
		<div
			tabIndex={0}
			class={styles.container}
			onScroll={onScroll}
			data-version={props.vbc.version}
		>
			<For each={vbcs()}>
				{c =>
					<InnerHtml
						url={vbcUrl(c.vbc)}
						amendHtml={html => {
							let res = [];
							const firstChapter = bookChapters(books(c.vbc.version), c.vbc.book)[0];
							if (c.vbc.chapter == firstChapter) {
								res.push(`<h1 class="${styles.bookTitle}">${bookNames[c.vbc.book]}</h1>`);
							}
							res.push(`<h2 class="${styles.chapterNumber}">${c.vbc.chapter}</h1>`);
							res.push(html)
							return res.join('');
						}}
						onSuccess={() => {
							c.loaded = true;
							if (bcEql(c.vbc, cur())) {
								const toLoad = nextN(c.vbc, books(c.vbc.version), 5)
									.map(vbc => ({ vbc: { version: cur().version, ...vbc }, loaded: false }));
								console.log(toLoad);
								setVbcs(existing => [...existing, ...toLoad]);
							}
						}}
						div={{
							/* data-* Needed for scroll tracking */
							'data-book': c.vbc.book,
							'data-chapter': c.vbc.chapter,
						}}
					/>
				}
			</For>
		</div>
	) as HTMLDivElement;

	createEffect(() => {
		if (props.onNavChange) props.onNavChange(cur());
	});

	// Scroll tracking (calls setCur)
	let lastScroll = container.scrollTop;
	function onScroll() {
		const target = container;
		const scrollBottom = target.scrollTop + target.clientHeight;
		for (let i = 0; i < container.children.length; i++) {
			const visible = container.children[container.children.length - i - 1] as HTMLDivElement;

			if (visible.offsetTop <= target.scrollTop) {
				const firstChapter = vbcFrom(visible);
				if (firstChapter) setCur(firstChapter);
				break;
			}
		}

		const chaps = vbcs();
		if (target.scrollHeight - scrollBottom < 500 && target.scrollTop > lastScroll) {
			const last = chaps[chaps.length - 1];
			if (!last.loaded) return;
			const next = nextBookChapter(last.vbc, props.indices[props.vbc.version].books, 1);
			if (!next) return;
			const vbc: VersionBookChapter = { version: last.vbc.version, ...next };
			setVbcs(existing => [...existing, { vbc, loaded: false }]);
		}

		if (target.scrollTop <= 300 && target.scrollTop < lastScroll) {
			const first = chaps[0];
			if (!first.loaded) return;
			const firstChapter = first.vbc;
			const version = firstChapter.version;
			const newPrev = nextBookChapter(firstChapter, books(version), -1);
			if (!newPrev) return;
			console.log(target.offsetTop);
			setPrev({ version, ...newPrev });
		}
		lastScroll = target.scrollTop;
	}
	const observer = new ResizeObserver(async () => {
		if (!isOverflown(container)) {
			// await init(cur());
		}
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

function vbcFrom(ele: Element): VersionBookChapter | undefined {
	const container = ele.parentElement as HTMLDivElement;
	const version = container.getAttribute('data-version');
	const book = ele.getAttribute('data-book') as BookId | null;
	const chapter = ele.getAttribute('data-chapter');
	if (version && book && chapter) return { version, book, chapter: +chapter };
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
