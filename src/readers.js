import { h, Component, createRef, Fragment } from 'preact'
import { Reader } from './reader'

export class Readers extends Component {
	state = {
		readers: [
			{ book: 'OBA', width: 0, readerRef: createRef() },
			{ book: 'MIC', width: 0, readerRef: createRef() },
			{ book: 'JUD', width: 0, readerRef: createRef() },
		]
	}
	preMouseMoveReaders
	initialPageX = 0

	onMouseMove = (e, index) => {
		e.preventDefault()
		const offsetX = e.pageX - this.initialPageX
		console.log(index, this.preMouseMoveReaders[0].width)
		this.state.readers.forEach((reader, i) => {
			const preMouseMoveWidth = this.preMouseMoveReaders[i].width
			if (i === index)
				reader.width = preMouseMoveWidth + offsetX
			else if (i === index + 1)
				reader.width = preMouseMoveWidth - offsetX
		})
		this.setState({ readers: this.state.readers })
	}

	componentDidMount() {
		this.state.readers.forEach(reader => {
			reader.width = reader.readerRef.current.base.offsetWidth
		})
		this.setState({ readers: this.state.readers })
	}

	mouseMoveHandler(e, index) {
		this.initialPageX = e.pageX
		this.preMouseMoveReaders = this.state.readers.map(r => Object.assign({}, r));
		
		const handler = e => this.onMouseMove(e, index)
		document.addEventListener('mousemove', handler)
		document.addEventListener('mouseup', _e =>
			document.removeEventListener('mousemove', handler))
	}

	render() {
		return (
			<Fragment>
				{this.state.readers.map((reader, index) => (
					<Fragment>
						<Reader book={reader.book} width={reader.width} ref={reader.readerRef} />
						{index !== this.state.readers.length - 1 &&
							<a className="dragbar" onMouseDown={e => this.mouseMoveHandler(e, index)} />}
					</Fragment>
				))}
			</Fragment>
		);
	}
}
