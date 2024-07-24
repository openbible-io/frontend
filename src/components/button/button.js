import { h } from 'preact'
import { forwardRef } from 'preact/compat'
import styles from './button.css'

export const Button = forwardRef(function Button({
	variant = "primary",
	onClick,
	children
}, ref) {
	return <button ref={ref} class={styles[variant]} onClick={onClick}>{children}</button>
})