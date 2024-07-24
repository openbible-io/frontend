import { h, Component, Fragment } from 'preact'
import { Reader, ReaderProps } from '../reader/reader'
import { setLocalReaders, getLocalReaders } from '../../utils/readers'
import { BookNames } from '../../utils'
import styles from './readers.css'

export interface ReaderState extends ReaderProps {
	width: number;
}

interface ReadersState {
	readers: ReaderState[];
}

/*
 *	Contains many <Reader>s and handles resizing them
 */
export class Readers extends Component<{}, ReadersState> {
	state = {
		readers: [
			{ text: 'en_ult', book: 'LUK' as BookNames, chapter: 4, width: 50 },
			{ text: 'en_ult', book: 'PSA' as BookNames, chapter: 119, width: 50 },
		]
	} as ReadersState
	preMoveMouseWidths: number[] = []
	initialPageX = 0

	constructor(props: {}) {
		super(props)
		const readers = getLocalReaders()
		if (readers.length > 0) {
			this.state = { readers }
		} else {
			this.state.readers.forEach(reader =>
				reader.width = 1 / this.state.readers.length)
		}
	}

	updateReaders() {
		const readers = this.state.readers
		setLocalReaders(readers)
		this.setState({ readers })
	}

	onMouseMove = (ev: any, index: number) => {
		ev.preventDefault()
		const offsetXPercent = (ev.pageX - this.initialPageX) / window.innerWidth
		this.state.readers.forEach((reader, i) => {
			if (i === index)
				reader.width = this.preMoveMouseWidths[i] + offsetXPercent
			else if (i === index + 1)
				reader.width = this.preMoveMouseWidths[i] - offsetXPercent
		})
		this.updateReaders()
	}

	mouseMoveHandler(ev: any, index: any) {
		ev.preventDefault()
		this.initialPageX = ev.pageX
		this.preMoveMouseWidths = this.state.readers.map(r => r.width)
		
		const handler = (ev: any) => this.onMouseMove(ev, index)
		document.addEventListener('mousemove', handler)
		document.addEventListener('mouseup', _ev =>
			document.removeEventListener('mousemove', handler))
	}

	onAddReader = (index: number) => {
		const readers = this.state.readers
		const newReader = Object.assign({}, readers[index])
		readers.splice(index, 0, newReader)
		this.updateReaders()
	}

	onCloseReader = (index: number) => {
		const readers = this.state.readers
		const lastWidth = readers[index].width
		readers.splice(index, 1)
		readers.forEach(reader => reader.width += lastWidth / readers.length)
		this.updateReaders()
	}

	onReaderChange = (reader: ReaderState, text: string, book: BookNames, chapter: number) => {
		reader.text = text
		reader.book = book
		reader.chapter = chapter
		this.updateReaders()
	}

	render() {
		return (
			<Fragment>
				{this.state.readers.map((reader, index) => (
					<Fragment key={index}>
						<Reader
							text={reader.text}
							book={reader.book}
							chapter={reader.chapter}
							style={{ width: `${reader.width * 100}%` }}
							onAddReader={() => this.onAddReader(index)}
							onCloseReader={() => this.onCloseReader(index)}
							onNavChange={(text, book, chapter) => this.onReaderChange(reader, text, book, chapter)}
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
