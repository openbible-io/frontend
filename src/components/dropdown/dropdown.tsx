import { h, Component, toChildArray, createRef } from 'preact'
import { Button } from '../button/button'
import { classnames } from '../../utils/classnames'
import styles from './dropdown.css'

interface DropdownProps {
	onSelect?: (index: number, ev: any) => void;
	onClick?: (ev: any) => void;
	style?: string | { [key: string]: string | number };
	icon?: preact.ComponentChild;
	selected?: preact.ComponentChild;
	isRight?: boolean;
}

interface DropdownState {
	isOpen: boolean;
}

export class Dropdown extends Component<DropdownProps, DropdownState> {
	state = {
		isOpen: false
	}
	buttonRef = createRef()
	buttonRef2 = createRef()
	ulRef = createRef()

	close = (ev?: any) => {
		if (ev && (ev.target === this.buttonRef.current ||
				ev.target === this.buttonRef2.current ||
				this.ulRef.current.contains(ev.target))) {
			// Let toggleOpen or selectItem handle it instead
			ev.preventDefault()
			return
		}
		this.setState({ isOpen: false })
		document.removeEventListener('mousedown', this.close)
	}

	toggleOpen = (_ev: any) => {
		const isOpen = this.state.isOpen
		if (!isOpen) {
			document.addEventListener('mousedown', this.close)
		}
		this.setState({ isOpen: !isOpen })
	}

	selectItem = (index: number, ev: any) => {
		const bubbleUp = this.props.onSelect
		if (bubbleUp) {
			bubbleUp(index, ev)
		}
		this.close()
	}

	render() {
		return (
			<div class={styles.dropdown}>
				<Button
					variant="secondary"
					ref={this.buttonRef}
					class={styles.iconButton}
					style={this.props.style}
					onClick={this.props.onClick || this.toggleOpen}
				>
					{this.props.selected || 'Choose item'}
				</Button>
				{this.props.icon && 
					<Button
						variant="secondary"
						ref={this.buttonRef2}
						class={styles.iconButton}
						onClick={this.toggleOpen}
					>
						{this.props.icon}
					</Button>
				}
				{this.state.isOpen &&
					<ul
						ref={this.ulRef}
						class={classnames(
							styles.dropdownList,
							this.props.isRight && styles.dropdownListRight
						)}
					>
						{toChildArray(this.props.children).map((child, index) =>
							<li onClick={ev => this.selectItem(index, ev)}>
								{child}
							</li>
						)}
					</ul>
				}
			</div>
		)
	}
}
