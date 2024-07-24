import { h, Component } from 'preact'
import { getChapter, getBooks } from './helpers'

export class Reader extends Component {
	static defaultProps = {
		book: 'GEN',
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

	render() {
		return (
			// Rely on flexbox for initial width
			<article style={this.props.width ? { width: this.props.width } : { flex: 1 }}>
				<select name="book" value={this.props.book} onChange={this.onBookChange}>
					{Object.entries(getBooks()).map(([key, val]) =>
						<option value={val} key={key}>{key}</option>
					)}
				</select>
				{JSON.stringify(this.state.book)}
			</article>
		);
	}
}
