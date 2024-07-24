import styles from './spinner.module.css';

export function Spinner() {
	return (
		<div class={styles.container}>
			<div class={styles.spinner} />
		</div>
	);
}
