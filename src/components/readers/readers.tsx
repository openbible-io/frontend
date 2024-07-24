import { h, Component, createRef, Fragment } from 'preact'
import { Reader, ReaderProps } from '../reader/reader'
import styles from './readers.css'
import { BookNames } from '../../utils'

interface ReaderState extends ReaderProps {
	width: number;
	ref: preact.Ref<Reader>;
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
			{ text: 'en_ult', width: 50, book: 'LUK' as BookNames, chapter: 4, ref: createRef() },
			{ text: 'en_ult', width: 50, book: 'PSA' as BookNames, chapter: 119, ref: createRef() },
		]
	} as ReadersState
	preMoveMouseWidths: number[] = []
	initialPageX = 0

	componentWillMount() {
		this.state.readers.forEach(reader =>
			reader.width = 1 / this.state.readers.length)
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
		this.setState({ readers: this.state.readers })
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
		const newReader = Object.assign({}, this.state.readers[index])
		newReader.ref = createRef()
		this.state.readers.splice(index, 0, newReader)
		this.setState({ readers: this.state.readers })
	}

	onCloseReader = (index: number) => {
		this.state.readers.splice(index, 1)
		this.setState({ readers: this.state.readers })
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
							ref={reader.ref}
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
