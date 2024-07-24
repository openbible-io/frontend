import { For, createResource, ResourceReturn, Show } from 'solid-js';
import { Reader } from '../reader/reader';
import { useLocalStorage, BibleChapter, BibleIndices, BibleIndex } from '../../utils';
import styles from './group.module.css';

export const defaultReaders = [
	// Single reader in case on small display
	new BibleChapter('en_ust', 'gen', 1),
];
// Only fetch this once.
let indexCache: ResourceReturn<BibleIndices> | undefined;

export function ReaderGroup() {
	// Source of truth on load.
	// Then <Reader /> becomes the source of truth and just calls back
	// to update this.
	const [readers, setReaders] = useLocalStorage<BibleChapter[]>(
		'chapters',
		defaultReaders,
		{
			deserializer: json => JSON.parse(json).map((j: BibleChapter) => BibleChapter.fromJson(j))
		}
	);
	if (readers().length == 0) setReaders(defaultReaders);

	indexCache = indexCache || createResource<BibleIndices>(async () =>
		 fetch(`${import.meta.env['OPENBIBLE_STATIC_URL']}/bibles/index.json`)
			.then(res => res.json() as Promise<BibleIndices>)
			.then(res => {
				Object.keys(res).forEach(version => {
					res[version] = BibleIndex.fromJson(version, res[version]);
				});
				return res;
			})
	);
	const [indices] = indexCache;

	function onAddReader(index: number) {
		const newReaders = [...readers()];
		newReaders.splice(index + 1, 0, defaultReaders[0]);
		setReaders(newReaders);
	}

	function onCloseReader(index: number) {
		const newReaders = [...readers()];
		newReaders.splice(index, 1);
		setReaders(newReaders);
	}

	function onNavChange(index: number, chapter: BibleChapter) {
		// Be sneaky and do NOT force a rerender while still saving to localstorage.
		const newReaders = readers();
		Object.assign(newReaders[index], chapter);
		setReaders(newReaders);
	}

	return (
		<div class={styles.readerGroup}>
			<For each={readers()}>
				{(chapter, index) =>
					<Show
						when={indices()}
						fallback={
							<>
								Fetching indices...
								{/* Indices is usually larger than this chapter which can prefetch */}
								<link
									rel="prefetch"
									type="fetch"
									crossorigin="anonymous"
									href={chapter.htmlUrl()}
								/>
							</>
						}>
						<Reader
							chapter={chapter}
							indices={indices()!}
							onAddReader={() => onAddReader(index())}
							onCloseReader={() => onCloseReader(index())}
							onNavChange={c => onNavChange(index(), c)}
							canClose={readers().length > 1}
						/>
						{index() !== readers().length - 1 &&
							<div class={styles.dragbar} />
						}
					</Show>
				}
			</For>
		</div>
	);
}
