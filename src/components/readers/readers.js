import { h, Component, createRef, Fragment } from 'preact'
import { Reader } from '../reader/reader'
import styles from './readers.css'

/*
 *	Contains many <Reader>s and handles resizing them
 */
export class Readers extends Component {
	state = {
		readers: [
			{ book: 'LUK', chapter: 4, readerRef: createRef() },
			{ book: 'PSA', chapter: 119, readerRef: createRef() },
		]
	}
	preMoveMouseWidths
	initialPageX = 0

	constructor(props) {
		super(props)
		this.state.readers.forEach(reader => {
			reader.width = 1 / this.state.readers.length
		})
	}

	onMouseMove = (e, index) => {
		e.preventDefault()
		const offsetXPercent = (e.pageX - this.initialPageX) / window.innerWidth
		this.state.readers.forEach((reader, i) => {
			if (i === index)
				reader.width = this.preMoveMouseWidths[i] + offsetXPercent
			else if (i === index + 1)
				reader.width = this.preMoveMouseWidths[i] - offsetXPercent
		})
		this.setState({ readers: this.state.readers })
	}

	mouseMoveHandler(e, index) {
		e.preventDefault()
		this.initialPageX = e.pageX
		this.preMoveMouseWidths = this.state.readers.map(r => r.width)
		
		const handler = e => this.onMouseMove(e, index)
		document.addEventListener('mousemove', handler)
		document.addEventListener('mouseup', _e =>
			document.removeEventListener('mousemove', handler))
	}

	onAddReader = index => {
		const newReader = Object.assign({}, this.state.readers[index])
		newReader.readerRef = createRef()
		this.state.readers.splice(index, 0, newReader)
		this.setState({ readers: this.state.readers })
	}

	onCloseReader = index => {
		this.state.readers.splice(index, 1)
		this.setState({ readers: this.state.readers })
	}

	render() {
		return (
			<Fragment>
				{this.state.readers.map((reader, index) => (
					<Fragment key={index}>
						<Reader
							book={reader.book}
							chapter={reader.chapter}
							width={`${reader.width * 100}%`}
							onAddReader={() => this.onAddReader(index)}
							onCloseReader={() => this.onCloseReader(index)}
							ref={reader.readerRef}
						/>
						{index !== this.state.readers.length - 1 &&
							<div
								class={styles.dragbar}
								onMouseDown={e => this.mouseMoveHandler(e, index)}
							/>
						}
					</Fragment>
				))}
			</Fragment>
		)
	}
}
