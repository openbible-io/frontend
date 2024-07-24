import { h } from 'preact'
import { forwardRef } from 'preact/compat'
import { classnames } from '../../utils/classnames'
import styles from './button.css'

interface ButtonProps {
	variant?: string;
	onClick?: (ev: any) => void;
	class?: string;
	style?: string | { [key: string]: string | number };
	children?: preact.ComponentChildren;
}

function ButtonFunc(props: ButtonProps, ref: preact.Ref<HTMLButtonElement>) {
	return <button
		ref={ref}
		class={classnames(
			styles.button,
			styles[props.variant || 'primary'],
			props.class
		)}
		onClick={props.onClick}
		style={props.style}
		tabIndex={0}
	>
		{props.children}
	</button>
}

export const Button = forwardRef(ButtonFunc)