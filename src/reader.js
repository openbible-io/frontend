import { h, Component } from 'preact'
import { getChapter, books } from './helpers'

export class Reader extends Component {
	static defaultProps = {
		book: books.GEN,
		chapter: 1,
		text: 'en_ult'
	}

	state = {
		book: null
	}

	constructor(props) {
		super(props)
		getChapter(props.text, props.book, props.chapter)
			.then(res => this.setState({ book: res }))
	}

	onBookChange = event => {
		this.props.book = event.target.value
		getChapter(this.props.text, this.props.book, this.props.chapter)
			.then(res => this.setState({ book: res }))
	}

	onChapterChange = event => {
		this.props.chapter = event.target.value
		getChapter(this.props.text, this.props.book, this.props.chapter)
			.then(res => this.setState({ book: res }))
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
				{JSON.stringify(this.state.book)}
			</article>
		);
	}
}
