import { h, Component, createRef } from 'preact'
import { Button } from '../button/button'
import { Dropdown } from '../dropdown/dropdown'
import { getChapter, books, texts, BookNames } from '../../utils'
import { getLocalHighlights, setLocalHighlight } from '../../utils/highlights'
import { onSelectChange, onCopy, selectedNodes } from './util/select'
import { renderParagraphs } from './util/renderer'
import HighlighterIcon from './icons/fa-highlighter.svg'
import styles from './reader.css'
import highlightStyles from './highlights.css'
import { Paragraph } from '../../utils/books'

const highlighterColors = ['red', 'blue', 'gray', 'yellow']

export interface ReaderProps {
	text: string;
	book: BookNames;
	chapter: number;
	// TODO: how to copy JSXInternal.HTMLAttributes<HTMLElement>.style?: string | {
	style?: { [key: string]: string | number } | string;
	onAddReader?: () => void;
	onCloseReader?: () => void;
}

interface ReaderState {
	paragraphs?: Paragraph[];
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

	constructor(props: ReaderProps) {
		super(props)
		this.fetchChapter(props.text, props.book, props.chapter)
	}

	componentDidUpdate() {
		const highlights = getLocalHighlights(this.props.book, this.props.chapter)
		if (Object.keys(highlights).length === 0) {
			return
		}
		const it = document.createNodeIterator(this.divRef.current)
		let node, highlight
		while (node = it.nextNode()) {
			if (node.nodeName === '#text') {
				const parentNode = node.parentNode as Element
				const id = parentNode.getAttribute('data-id') as string
				if (highlights[id]) {
					highlight = highlights[id]
				}
				if (highlight) {
					this.highlightNode(parentNode, highlight.color)
					if (id === highlight.toId) {
						highlight = undefined
					}
				}
			}
		}
	}

	fetchChapter(text: string, book: string, chapter: number) {
		getChapter(text, book, chapter)
			.then(data => this.setState({ paragraphs: data }))
	}

	onBookChange = (ev: any) => {
		const book = ev.target.value as BookNames
		let chapter = this.props.chapter
		if (chapter > books[book].chapters)
			chapter = books[book].chapters
		this.fetchChapter(this.props.text, book, chapter)
	}

	onChapterChange = (ev: any) => {
		this.fetchChapter(this.props.text, this.props.book, ev.target.value)
	}

	onTextChange = (ev: any) => {
		this.fetchChapter(ev.target.value, this.props.book, this.props.chapter)
	}

	// Add highlight class
	highlightNode(node: Node, color: keyof typeof highlightStyles) {
		(node as Element).classList.add(highlightStyles[color])
	}

	onHighlight = () => {
		const containedNodes = selectedNodes
			.filter(node => this.divRef.current.contains(node))

		containedNodes.map(node => this.highlightNode(node, this.state.selectedColor))
		// Save locally
		const ids = containedNodes
			.map(node => (node as Element).getAttribute('data-id'))
			.filter(Boolean)
		const fromId = ids[0] as string
		const toId = ids[ids.length - 1] as string
		setLocalHighlight(
			this.props.book,
			this.props.chapter,
			fromId,
			toId,
			this.state.selectedColor
		);
		(document.getSelection() as Selection).removeAllRanges()
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
							{new Array(books[this.props.book].chapters)
								.map((_el: number, i: number) =>
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
						<Dropdown
							isRight
							icon="▼"
							selected={<HighlighterIcon height="12px" style={'fill: #5f6368;'} />}
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
					{renderParagraphs(this.state.paragraphs)}
				</div>
			</article>
		)
	}
}
