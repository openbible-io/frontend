import { h } from 'preact'
import { useState, useRef, useEffect } from 'preact/hooks'
import { getChapter, books, texts, BookName, useLocalStorage } from '../../utils'
import { ElementType } from '../../utils/books'
import styles from './reader.css'
import { defaultSettings } from '../../pages'
import { Element } from '../element'

export interface ReaderProps {
	text: string;
	book: BookName;
	chapter: number;
	// TODO: how to copy JSXInternal.HTMLAttributes<HTMLElement>.style?: string | {
	style?: { [key: string]: string | number } | string;
	onAddReader?: () => void;
	onCloseReader?: () => void;
	onNavChange?: (text: string, book: BookName, chapter: number) => void
}

export function Reader(props = {
	book: books.GEN.name,
	chapter: 1,
	text: 'en_ust',
} as ReaderProps) {
	const [elements, setElements] = useState([] as ElementType[])
	const [config,] = useLocalStorage('settings', defaultSettings);
	const divRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		getChapter(props.text, props.book, props.chapter)
			.then(elements => setElements(elements))
	}, [])

	const onNavChange = (text: string, book: BookName, chapter: number) => {
		getChapter(text, book, chapter)
			.then(paragraphs => {
				setElements(paragraphs)
				if (divRef.current) {
					divRef.current.scrollTop = 0
				}
			})
		if (props.onNavChange) {
			props.onNavChange(text, book, chapter)
		}
	}

	const onBookChange = (ev: any) => {
		const book = ev.target.value as BookName
		let chapter = props.chapter
		if (chapter > books[book].chapters)
			chapter = books[book].chapters
		onNavChange(props.text, book, chapter)
	}

	const onChapterChange = (ev: any) => {
		onNavChange(props.text, props.book, ev.target.value)
	}

	const onTextChange = (ev: any) => {
		onNavChange(ev.target.value, props.book, props.chapter)
	}

	const style = props.style || {}
	return (
		<article class={styles.article} style={style}>
			<div class={styles.navContainer}>
				<nav>
					<select name="book" value={props.book} onChange={onBookChange}>
						{Object.entries(books).map(([key, val]) =>
							<option value={key} key={key}>{val.name}</option>
						)}
					</select>
					<select name="chapter" value={props.chapter} onChange={onChapterChange}>
						{Array.apply(null, Array(books[props.book].chapters))
							.map((_el: unknown, i: number) =>
								<option value={i + 1} key={i}>{i + 1}</option>
						)}
					</select>
					<select name="text" value={props.text} onChange={onTextChange}>
						{Object.entries(texts).map(([key, val]) =>
							<option value={key} key={key}>{key}</option>
						)}
					</select>
				</nav>
				<div>
					<button
						onClick={props.onAddReader}
						class={styles.windowButton}
					>
						+
					</button>
					<button
						onClick={props.onCloseReader}
						class={styles.windowButton}
					>
						x
					</button>
				</div>
			</div>
			<div
				ref={divRef}
				class={styles.reader}
				tabIndex={0}
			>
				{elements.map(e => <Element {...e} />)}
			</div>
		</article>
	)
}
