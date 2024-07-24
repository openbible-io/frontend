import { createSignal, createEffect, For, Switch, Match, batch, createMemo, Show } from 'solid-js';
import { BookId, VersionBookChapter, BibleInfos, BibleInfo, bookNames, infoAboutUrl, bookChapters } from '../../bibles';
import { InfoIcon, ThreeDotsVerticalIcon } from '../../icons/index';
import { Dropdown, InnerHtml } from '../index';
import styles from './nav.module.css';

export interface ReaderNavProps {
	indices: BibleInfos;
	chapter: VersionBookChapter;
	onNavChange: (chapter: VersionBookChapter) => void;
};
export function ReaderNav(props: ReaderNavProps) {
	const [version, setVersion] = createSignal(props.chapter.version);
	const [book, setBook] = createSignal(props.chapter.book);
	const [chapter, setChapter] = createSignal(props.chapter.chapter);

	createEffect(() => {
		batch(() => {
			setVersion(props.chapter.version);
			setBook(props.chapter.book);
			setChapter(props.chapter.chapter);
		});
	});

	const info = createMemo(() => props.indices[version()]);
	const books = createMemo(() => info().books);

	function onVersionChange(newVersion: string) {
		let b = book();
		const newBooks = props.indices[newVersion].books ?? {};
		if (!(b in newBooks)) {
			b = (Object.keys(newBooks) as BookId[])[0];
		}
		let c = chapter();
		const newChapters = bookChapters(books(), b);
		if (!newChapters.includes(c)) {
			c = newChapters[0];
		}
		props.onNavChange({ version: newVersion, book: b, chapter: c });
	}

	function onBookChange(newBook: BookId) {
		const firstChapter = bookChapters(info().books, newBook)[0];
		props.onNavChange({ version: version(), book: newBook, chapter: firstChapter });
	}

	function onChapterChange(newChapter: number) {
		props.onNavChange({ version: version(), book: book(), chapter: newChapter });
	}

	const nav = (
		<nav class={styles.nav}>
			<VersionInfo info={info()} />
			<select
				name="book"
				value={book()}
				onChange={ev => onBookChange(ev.target.value as BookId)}
			>
				<For each={Object.keys(info().books) as BookId[]}>
					{b => <option value={b}>{bookNames[b]}</option>}
				</For>
			</select>
			<select
				name="chapter"
				value={chapter()}
				onChange={ev => onChapterChange(+ev.target.value)}
			>
				<For each={bookChapters(books(), book())}>
					{c => <option value={c}>{c}</option>}
				</For>
			</select>
			<select
				name="version"
				value={version()}
				onChange={ev => onVersionChange(ev.target.value)}
			>
				<For each={Object.entries(props.indices)}>
					{([k, v]) => (
						<option value={k} title={v.title}>
							{k.substring(3)}
						</option>
					)}
				</For>
			</select>
			<button popoverTarget="version-info">
				<InfoIcon width="1rem" height="1rem" />
			</button>
		</nav>
	);

	return (
		<div class={styles.container}>
			<Dropdown
				button={{
					class: styles.dropdown,
					children: <ThreeDotsVerticalIcon width="1rem" height="1rem" />
				}}
				div={{
					class: styles.popover,
					children: nav
				}}
			/>
		</div>
	);
}

interface VersionInfoProps {
	info: BibleInfo;
}
function VersionInfo(props: VersionInfoProps) {
	type View = 'info' | 'foreword';
	const [view, setView] = createSignal<View>('info');
	createEffect(() => {
		props.info;
		setView('info');
	});

	return (
		<div popover id="version-info" class={styles.versionInfo}>
			<nav>
				<ul>
					<li><button onClick={() => setView('info')}>Info</button></li>
					<li>
						<button
							onClick={() => setView('foreword')}
							disabled={!Boolean(props.info.about)}
						>
							Foreword
						</button>
					</li>
				</ul>
			</nav>
			<Switch>
				<Match when={view() == 'info'}>
					<h1>
						<a href={props.info.downloadUrl} target="_blank">{props.info.title}</a>
					</h1>
					<div>Publisher: <a href={props.info.publisherUrl} target="_blank">{props.info.publisher}</a></div>
					<div>License: <a href={props.info.licenseUrl}>{props.info.license}</a></div>
					<Show when={props.info.authors?.length}>
						<div>Authors:
							<ul class={styles.authors}>
								<For each={props.info.authors}>
									{name => <li>{name}</li>}
								</For>
							</ul>
						</div>
					</Show>
					<div>Modified: {props.info.modified}</div>
					<a href={props.info.repo}>Repo</a>
				</Match>
				<Match when={view() == 'foreword'}>
					<InnerHtml url={infoAboutUrl(props.info)} />
				</Match>
			</Switch>
		</div>
	);
}
