import { h, Component, createRef } from 'preact'
import { Button } from '../button/button'
import { Dropdown } from '../dropdown/dropdown'
import { getChapter, books, texts } from '../../utils'
import { getLocalHighlights, setLocalHighlight } from '../../utils/highlights'
import { onSelectChange, onCopy, selectedNodes } from './util/select'
import { renderChildren } from './util/renderer'
import HighlighterIcon from './icons/fa-highlighter.svg'
import styles from './reader.css'
import highlightStyles from './highlights.css'

const highlighterColors = ['red', 'blue', 'gray', 'yellow']

export class Reader extends Component {
	static defaultProps = {
		book: books.GEN,
		chapter: 1,
		text: Object.keys(texts)[0]
	}

	state = {
		data: null,
		selectedColor: highlighterColors[0]
	}
	divRef = createRef()

	constructor(props) {
		super(props)
		this.fetchChapter()
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
				const parentNode = node.parentNode
				const id = parentNode.getAttribute('data-id')
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

	fetchChapter = () => {
		getChapter(this.props.text, this.props.book, this.props.chapter)
			.then(res => this.setState({ data: res }))
	}

	onBookChange = ev => {
		this.props.book = ev.target.value
		if (this.props.chapter > books[this.props.book].chapters)
			this.props.chapter = books[this.props.book].chapters
		this.fetchChapter()
	}

	onChapterChange = ev => {
		this.props.chapter = ev.target.value
		this.fetchChapter()
	}

	onTextChange = ev => {
		this.props.text = ev.target.value
		this.fetchChapter()
	}

	// Add highlight class
	highlightNode(node, color) {
		node.classList.add(highlightStyles[color])
	}

	onHighlight = () => {
		const containedNodes = selectedNodes
			.filter(node => this.divRef.current.contains(node))

		containedNodes.map(node => this.highlightNode(node, this.state.selectedColor))
		// Save locally
		const ids = containedNodes
			.map(node => node.getAttribute('data-id'))
			.filter(Boolean)
		const fromId = ids[0]
		const toId = ids[ids.length - 1]
		setLocalHighlight(
			this.props.book,
			this.props.chapter,
			fromId,
			toId,
			this.state.selectedColor
		)
		document.getSelection().removeAllRanges()
	}
 
	render() {
		let selectedColor = this.state.selectedColor
		const style = this.props.style || {}
		const width = this.props.width
		if (width) {
			style.width = width;
		}
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
							{Array.apply(null, { length: books[this.props.book].chapters })
								.map(Number.call, Number)
								.map(i =>
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
							onSelect={index => {
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
					tabindex="0"
				>
					{renderChildren(this.state.data)}
				</div>
			</article>
		)
	}
}
