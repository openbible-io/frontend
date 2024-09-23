import { useContext } from 'solid-js';
import { Context } from '../settings/values';
import { Tabs } from './tabs';
import styles from './settings.module.css';

export function Settings() {
	const ctx = useContext(Context);
	const onReset = (ev: Event) => {
		ev.preventDefault();
		type UseType = [() => any, (val: any) => void, () => void];
		Object.values(ctx as unknown as UseType[]).forEach(i => i[2]());
	};

	const options = Object.entries(ctx).map(([category, val]) => [
		category,
		<form class={styles.form} onReset={onReset}>
			<table>
				<tbody>
					{Object.entries(val).map(([id, { signal: [getter, setter], Control }]) => 
						<tr>
							<td>
								<label for={id}>
									{id}
								</label>
							</td>
							<td>
								<Control id={id} getter={getter} setter={setter} />
							</td>
						</tr>
					)}
				</tbody>
			</table>
			<input type="reset" value="Reset all" />
		</form>
	]);

	return <Tabs options={options} />;
}
