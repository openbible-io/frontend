import { h, Component } from 'preact'
import { Dropdown } from '../dropdown/dropdown'
import { getChapter, books, texts } from '../../utils'
import { onSelectChange, onCopy } from './util/select'
import { renderChildren } from './util/renderer'
import HighlighterIcon from './icons/highlighter.svg'
import styles from './reader.css'

export class Reader extends Component {
	static defaultProps = {
		book: books.GEN,
		chapter: 1,
		text: Object.keys(texts)[0]
	}

	state = {
		data: null
	}

	constructor(props) {
		super(props)
		this.fetchChapter()
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

	render() {
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
						<button>
							<HighlighterIcon width="16px" />
						</button>
					</div>
				</div>
				<div
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
