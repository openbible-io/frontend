import { createSignal, Show, onCleanup, createEffect } from 'solid-js';
import { SolidPlusIcon, SolidXIcon } from '../../icons/index';
import { ReaderNav } from './nav';
import { BibleIndices, BibleChapter, BookId } from '../../utils';
import styles from './reader.module.css';

const maxLoaded = 50;

export interface ReaderProps {
	chapter: BibleChapter;
	indices: BibleIndices;
	onAddReader?: () => void;
	onCloseReader?: () => void;
	onNavChange?: (chapter: BibleChapter) => void
	canClose?: boolean;
	class?: string;
};

export function Reader(props: ReaderProps) {
	// source of truth
	const container = (
		<div
			tabIndex={0}
			class={styles.container}
			onScroll={onScroll}
			data-version={props.chapter.version}
		/>
	) as HTMLDivElement;
	const [next, setNext] = createSignal(props.chapter.next(props.indices, 1), {
		equals: BibleChapter.eql,
	});
	const [cur, setCur] = createSignal(props.chapter, { equals: BibleChapter.eql });

	async function loadChapter(chapter: BibleChapter, forward: boolean): Promise<boolean> {
		if (!isLoaded(container, chapter)) {
			const ele = document.createElement('div');
			ele.className = styles.reader;
			ele.setAttribute('data-book', chapter.book);
			ele.setAttribute('data-chapter', chapter.chapter.toString());
			ele.setAttribute('data-loading', '');
			if (forward) {
				container.appendChild(ele);
			} else {
				container.insertBefore(ele, container.firstChild);
			}
			ele.innerHTML = '<p>Loading...</p>';

			return chapter.fetchHtml()
				.then(html => {
					ele.innerHTML = html;
					ele.removeAttribute('data-loading');
					if (container.children.length > maxLoaded) {
						if (forward) {
							container.firstChild?.remove();
						} else {
							container.lastChild?.remove();
						}
					}
					return true;
				})
				.catch(err => {
					ele.remove();
					const error = Retry(err, () => loadChapter(chapter, forward));
					container.appendChild(error);
					return false
				});
		}

		return true;
	}

	let lastScroll = container.scrollTop;
	function onScroll() {
		const target = container;
		const scrollBottom = target.scrollTop + target.clientHeight;
		let ele: HTMLDivElement;
		for (let i = 0; i < container.children.length; i++) {
			ele = container.children[container.children.length - i - 1] as HTMLDivElement;

			if (ele.offsetTop - 100 <= target.scrollTop) {
				const chapter = bibleChapter(ele);
				setCur(chapter);
				break;
			}
		}

		if (target.scrollHeight - scrollBottom < 300 && target.scrollTop > lastScroll) {
			const lastChild = container.lastChild as HTMLDivElement;
			if (lastChild.attributes.getNamedItem('data-loading')) return;
			const last = bibleChapter(lastChild);
			const n = last.next(props.indices, 1);
			if (n) {
				loadChapter(n, true);
				setNext(n.next(props.indices, 1));
			}
		}

		if (target.offsetTop <= 100 && target.scrollTop < lastScroll) {
			const prev = cur().next(props.indices, -1);
			if (prev) {
				loadChapter(prev, false);
			}
		}
		lastScroll = target.scrollTop;
	}

	async function init(chapter: BibleChapter) {
		const toLoad = [];
		let next: BibleChapter | undefined = chapter;
		for (let i = 0; i < 5 && next; i++) {
			toLoad.push(loadChapter(next, true));
			next = next.next(props.indices, 1);
		}
		await Promise.all(toLoad);
	}
	const observer = new ResizeObserver(async () => {
		if (!isOverflown(container)) await init(cur());
	});
	observer.observe(container);
	onCleanup(() => observer.disconnect());

	createEffect(() => {
		const firstEle = container.firstElementChild;
		if (firstEle && bibleChapter(firstEle) == cur()) return;
		init(cur());
		if (props.onNavChange) props.onNavChange(cur());
	});

	return (
		<article class={`${styles.article} ${props.class ?? ''}`}>
			<header>
				<ReaderNav
					chapter={cur()}
					indices={props.indices}
					onNavChange={c => {
						container.innerHTML = '';
						setCur(c);
					}}
				/>
				<div style="flex: 1" />
				<span class={styles.windowButtons}>
					<button
						onClick={props.onAddReader}
						class={styles.windowButton}
					>
						<SolidPlusIcon style={{ fill: '#5f6368' }} height="1rem" width="1rem" />
					</button>
					<button
						onClick={props.onCloseReader}
						class={styles.windowButton}
						disabled={!props.canClose}
					>
						<SolidXIcon style={{ fill: '#5f6368' }} height="1rem" width="1rem" />
					</button>
				</span>
			</header>
			{container}
			<Show when={next()}>
				<link
					rel="prefetch"
					crossorigin="anonymous"
					type="fetch"
					href={next()!.htmlUrl()}
				/>
			</Show>
		</article>
	);
}

function bibleChapter(ele: Element): BibleChapter {
	const container = ele.parentElement as HTMLDivElement;
	const version = container.attributes.getNamedItem('data-version')!.value;
	const book = ele.attributes.getNamedItem('data-book')!.value as BookId;
	const chapter = ele.attributes.getNamedItem('data-chapter')!.value;
	return new BibleChapter(version, book, +chapter);
}

export function Retry(err: Error, retry: () => void) {
	const res = document.createElement('div');
	const errText = document.createTextNode(err.toString());
	res.appendChild(errText);
	const button = document.createElement('button');
	const buttonText = document.createTextNode('Retry');
	button.appendChild(buttonText);
	button.addEventListener('click', () => {
		res.remove();
		retry();
	});
	res.appendChild(button);

	return res;
}

function isOverflown(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function isLoaded(container: HTMLDivElement, chapter: BibleChapter): boolean {
	for (let i = 0; i < container.children.length; i++) {
		const ele = container.children[i];
		if (
		 ele.attributes.getNamedItem('data-book')?.value == chapter.book &&
		 ele.attributes.getNamedItem('data-chapter')?.value == chapter.chapter.toString()
		) {
			return true;
		};
	}
	return false;
}
