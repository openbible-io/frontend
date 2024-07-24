import { h } from 'preact'
import { useState } from 'preact/hooks'
import styles from './toolbar.css'
import HighlighterIcon from '../../icons/fa-highlighter.svg'
import AddCommentIcon from '../../icons/md-add-comment.svg'
import { emit } from '../../utils/eventEmitter'

const highlighterColors = ['red', 'blue', 'gray', 'yellow']

export function Toolbar() {
	const [selectedColor, setSelectedColor] = useState(highlighterColors[0])


	return (
		<div class={styles.toolbar} role="toolbar">
			<button onClick={() => emit('ADD_NOTE')}>
				<AddCommentIcon height="16px" style="fill: #5f6368;" />
			</button>
			{/* <Dropdown
				isRight
				icon="▼"
				selected={<HighlighterIcon height="12px" style="fill: #5f6368;" />}
				onSelect={(index: number) => {
					this.setState({ selectedColor: highlighterColors[index] })
					this.onHighlight(highlighterColors[index])
				}}
				onClick={() => this.onHighlight(selectedColor)}
				style={{ borderBottom: `4px solid ${this.state.selectedColor}` }}
			>
				{highlighterColors.map(color =>
					<HighlighterIcon value={color} height="12px" style={`fill: ${color};`} />
				)}
			</Dropdown> */}
		</div>
	)
}