import { h, Component } from 'preact'
import { getChapter, books, renderChildren } from './helpers'

export class Reader extends Component {
	static defaultProps = {
		book: books.GEN,
		chapter: 1,
		text: 'en_ult'
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

	onBookChange = e => {
		this.props.book = e.target.value
		if (this.props.chapter > books[this.props.book].chapters)
			this.props.chapter = books[this.props.book].chapters
		this.fetchChapter()
	}

	onChapterChange = e => {
		this.props.chapter = e.target.value
		this.fetchChapter()
	}

	render() {
		return (
			// Rely on flexbox for initial width
			<article style={this.props.width ? { width: this.props.width } : { flex: 1 }}>
				<select name="book" value={this.props.book} onChange={this.onBookChange}>
					{Object.entries(books).map(([key, val]) =>
						<option value={key} key={key}>{val.name}</option>
					)}
				</select>
				<select name="chapter" value={this.props.chapter} onChange={this.onChapterChange}>
					{[...Array(books[this.props.book].chapters)].map((u, i) =>
						<option value={i + 1} key={i}>{i + 1}</option>
					)}
				</select>
				<br />
				{this.state.data && renderChildren(this.state.data.chapter.children)}
			</article>
		);
	}
}
