import { h, Component, createRef } from 'preact'
import { Button } from '../button/button'
import { Dropdown } from '../dropdown/dropdown'
import { getChapter, books, texts, BookNames } from '../../utils'
import { ParagraphType, VerseType, NoteType } from '../../utils/books'
import { getLocalHighlights, setLocalHighlight, Highlight } from '../../utils/highlights'
import { onSelectChange, onCopy, selectedNodes, getRange } from '../paragraphs/select'
import { NoteContext } from '../paragraphs/notecontext'
import { Paragraphs } from '../paragraphs/paragraphs'
import { setLocalNote, getLocalNotes, SavedNote } from '../../utils/notes'
import HighlighterIcon from '../../icons/fa-highlighter.svg'
import AddCommentIcon from '../../icons/md-add-comment.svg'
import styles from './reader.css'

const highlighterColors = ['red', 'blue', 'gray', 'yellow']

export interface ReaderProps {
	text: string;
	book: BookNames;
	chapter: number;
	// TODO: how to copy JSXInternal.HTMLAttributes<HTMLElement>.style?: string | {
	style?: { [key: string]: string | number } | string;
	onAddReader?: () => void;
	onCloseReader?: () => void;
	onNavChange?: (text: string, book: BookNames, chapter: number) => void
}

interface ReaderState {
	paragraphs?: ParagraphType[];
	selectedColor: string;
}

export class Reader extends Component<ReaderProps, ReaderState> {
	static defaultProps = {
		book: books.GEN,
		chapter: 1,
		text: Object.keys(texts)[0]
	}

	state = {
		paragraphs: [],
		selectedColor: highlighterColors[0]
	} as ReaderState

	divRef = createRef()

	visit(
		verse: ParagraphType | VerseType,
		visitor: (verse: VerseType) => void
	) {
		visitor(verse)
		if (Array.isArray(verse.v)) {
			(verse as ParagraphType).v.forEach(v => this.visit(v, visitor))
		}
	}

	visitParagraphs(
		paragraphs: ParagraphType[] | undefined,
		visitor: (verse: VerseType) => void
	) {
		if (!paragraphs) {
			return
		}
		paragraphs.forEach(p => this.visit(p, visitor))
	}

	constructor(props: ReaderProps) {
		super(props)
		this.fetchChapter(props.text, props.book, props.chapter)
			.then(paragraphs => {
				const highlights = getLocalHighlights(this.props.book, this.props.chapter)
				const notes = getLocalNotes(this.props.book, this.props.chapter)
				let highlight: Highlight | undefined
				let note: NoteType | undefined
				this.visitParagraphs(paragraphs, verse => {
					if (!highlight) {
						highlight = highlights[verse.id]
					}
					else {
						verse.highlight = highlight.color
						if (verse.id >= +highlight.toId) {
							highlight = undefined
						}
					}

					const savedNote = notes[verse.id]
					if (!note && savedNote) {
						note = {
							fromId: verse.id,
							toId: +savedNote.toId,
							note: savedNote.note,
							isFormOpen: false,
						}
					}
					if (note) {
						verse.noted = verse.id + ''
						if (verse.id >= note.toId) {
							verse.note = note
							note = undefined
						}
					}
				})
				this.setState({ paragraphs })
			})
	}

	fetchChapter(text: string, book: string, chapter: number) {
		return getChapter(text, book, chapter)
			.then(paragraphs => {
				this.setState({ paragraphs })
				return paragraphs
			})
	}

	onNavChange(text: string, book: BookNames, chapter: number) {
		this.fetchChapter(text, book, chapter)
		if (this.props.onNavChange) {
			this.props.onNavChange(text, book, chapter)
		}
	}

	onBookChange = (ev: any) => {
		const book = ev.target.value as BookNames
		let chapter = this.props.chapter
		if (chapter > books[book].chapters)
			chapter = books[book].chapters
		this.onNavChange(this.props.text, book, chapter)
	}

	onChapterChange = (ev: any) => {
		this.onNavChange(this.props.text, this.props.book, ev.target.value)
	}

	onTextChange = (ev: any) => {
		this.onNavChange(ev.target.value, this.props.book, this.props.chapter)
	}

	getSelectedNodes = () => {
		if (!getRange()) {
			return
		}
		const containedNodes = selectedNodes
			.filter(node => this.divRef.current.contains(node))

		const ids = containedNodes
			.map(node => (node as Element).getAttribute('data-id'))
			.filter(Boolean)
		return {
			containedNodes,
			fromId: ids[0],
			toId: ids[ids.length - 1]
		}
	}

	onHighlight = () => {
		const selected = this.getSelectedNodes()
		if (!selected) {
			return
		}

		const paragraphs = this.state.paragraphs
		if (selected.fromId && selected.toId) {
			const fromId = +selected.fromId
			const toId = +selected.toId
			this.visitParagraphs(paragraphs, verse => {
				if (verse.id >= fromId && verse.id <= toId) {
					verse.highlight = this.state.selectedColor
				}
			})
			this.setState({ paragraphs })

			// Save locally
			setLocalHighlight(
				this.props.book,
				this.props.chapter,
				selected.fromId,
				selected.toId,
				this.state.selectedColor
			)
			const selection = document.getSelection()
			if (selection) {
				selection.removeAllRanges()
			}
		}
	}

	onNoteAdd = () => {
		const selected = this.getSelectedNodes()
		if (!selected) {
			return
		}

		const paragraphs = this.state.paragraphs
		if (selected.fromId && selected.toId) {
			const fromId = +selected.fromId
			const toId = +selected.toId
			this.visitParagraphs(paragraphs, v => {
				if (v.id >= fromId && v.id <= toId) {
					v.noted = selected.fromId
				}
				if (v.id === toId) {
					v.note = { fromId, toId, note: '', isFormOpen: true }
				}
			})
			this.setState({ paragraphs })

			const selection = document.getSelection()
			if (selection) {
				selection.removeAllRanges()
			}
		}
	}

	onNoteSubmit = (note: NoteType) => {
		setLocalNote(
			this.props.book,
			this.props.chapter,
			note.fromId + '',
			note.toId + '',
			note.note
		)
		this.setState({ paragraphs: this.state.paragraphs })
	}

	render() {
		let selectedColor = this.state.selectedColor
		const style = this.props.style || {}
		return (
			<article class={styles.article} style={style}>
				<div class={styles.toolbarContainer}>
					<nav>
						<select name="book" value={this.props.book} onChange={this.onBookChange}>
							{Object.entries(books).map(([key, val]) =>
								<option value={key} key={key}>{val.name}</option>
							)}
						</select>
						<select name="chapter" value={this.props.chapter} onChange={this.onChapterChange}>
							{Array.apply(null, Array(books[this.props.book].chapters))
								.map((_el: unknown, i: number) =>
									<option value={i + 1} key={i}>{i + 1}</option>
							)}
						</select>
						<select name="text" value={this.props.text} onChange={this.onTextChange}>
							{Object.entries(texts).map(([key, val]) => 
								<option value={key} key={key}>{key}</option>
							)}
						</select>
					</nav>
					<div class={styles.toolbar}>
						<Button variant="secondary" onClick={this.onNoteAdd}>
							<AddCommentIcon height="12px" style="fill: #5f6368;" />
						</Button>
						<Dropdown
							isRight
							icon="▼"
							selected={<HighlighterIcon height="12px" style="fill: #5f6368;" />}
							onSelect={(index: number) => {
								selectedColor = highlighterColors[index]
								this.setState({ selectedColor })
								this.onHighlight()
							}}
							onClick={this.onHighlight}
							style={{ borderBottom: `4px solid ${selectedColor}` }}
						>
							{highlighterColors.map(color =>
								<HighlighterIcon value={color} height="12px" style={`fill: ${color};`} />
							)}
						</Dropdown>
					</div>
					<div>
						<Button
							variant="secondary"
							onClick={this.props.onAddReader}
							class={styles.windowButton}
						>
							+
						</Button>
						<Button
							variant="secondary"
							onClick={this.props.onCloseReader}
							class={styles.windowButton}
						>
							x
						</Button>
					</div>
				</div>
				<div
					ref={this.divRef}
					onMouseUp={onSelectChange}
					onKeyUp={onSelectChange}
					class={styles.reader}
					onCopy={onCopy}
					tabIndex={0}
				>
					<NoteContext.Provider value={{
						onNoteSubmit: this.onNoteSubmit
					}}>
						<Paragraphs	paragraphs={this.state.paragraphs} />
					</NoteContext.Provider>
				</div>
			</article>
		)
	}
}
