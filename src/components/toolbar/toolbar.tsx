import { h } from 'preact'
import { useState } from 'preact/hooks'
import styles from './toolbar.css'
import { AddCommentIcon, UndoIcon, RedoIcon, FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon, TextColorIcon, HighlightColorIcon } from '../../icons'
import { emit } from '../../utils/eventEmitter'

const colors = ['red', 'blue', 'gray', 'yellow']

const actions = [
	{
		icon: UndoIcon,
		tooltip: 'Undo',
		onClick: () => {}
	},
	{
		icon: RedoIcon,
		tooltip: 'Redo',
		onClick: () => {}
	},
	{
		icon: FormatBoldIcon,
		tooltip: 'Bold',
		onClick: () => {}
	},
	{
		icon: FormatItalicIcon,
		tooltip: 'Italic',
		onClick: () => {}
	},
	{
		icon: FormatUnderlinedIcon,
		tooltip: 'Underlined',
		onClick: () => {}
	},
	{
		icon: TextColorIcon,
		tooltip: 'Text color',
		color: colors[0],
		onClick: () => {}
	},
	{
		icon: HighlightColorIcon,
		tooltip: 'Highlight color',
		color: colors[0],
		onClick: () => {}
	},
	{
		icon: AddCommentIcon,
		tooltip: 'Add comment',
		onClick: () => emit('ADD_NOTE')
	}
]

export function Toolbar() {
	const [selectedColor, setSelectedColor] = useState(colors[0])


	return (
		<div class={styles.toolbar} role="toolbar">
			{actions.map(action => 
				<button class={styles.button} onClick={action.onClick}>
					<action.icon
						style={{ fill: '#5f6368;',  borderBottom: `4px solid ${action.color}` }}
					/>
					<span class={styles.tooltip}>
						{action.tooltip}
					</span>
				</button>
			)}
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