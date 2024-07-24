import { h, render, Fragment } from 'preact';
import { Nav } from './nav';
import { Readers } from './readers';
import './app.sass';

const element = (
	<Fragment>
		<Nav className="hi" />
		<main>
			<Readers />
		</main>
	</Fragment>
);

render(element, document.body);
