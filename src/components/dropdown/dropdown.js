import { h, Component, toChildArray, createRef } from 'preact'
import { Button } from '../button/button'
import styles from './dropdown.css'

export class Dropdown extends Component {
	state = {
		isOpen: false
	}
	buttonRef = createRef()

	close = event => {
		if (event.target === this.buttonRef.current) {
			// Let toggleOpen handle it instead
			return
		}
		this.setState({ isOpen: false })
		document.removeEventListener('mousedown', this.close)
	}

	toggleOpen() {
		const isOpen = this.state.isOpen
		if (!isOpen) {
			document.addEventListener('mousedown', this.close)
		}
		this.setState({ isOpen: !isOpen })
	}

	selectItem(item) {
		const bubbleUp = this.props.onSelect
		if (bubbleUp) {
			bubbleUp(item)
		}
		this.close()
	}

	render() {
		return (
			<div class={styles.dropdown}>
				<Button ref={this.buttonRef} onClick={() => this.toggleOpen()}>Really long thing haha</Button>
				{this.state.isOpen &&
					<ul class={styles.dropdownList}>
						{toChildArray(this.props.children).map(child =>
							<li onClick={() => this.selectItem(child)}>{child}</li>
						)}
					</ul>
				}
			</div>
		)
	}
}
