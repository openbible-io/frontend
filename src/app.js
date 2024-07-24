import { h, render, Fragment } from 'preact';
import { Nav } from './nav.js';
import { Reader } from './reader.js';
import './app.sass';

const element = (
	<Fragment>
		<Nav className="hi" />
		<main>
			<Reader book={'EXO'}/>
			<a className="dragbar" />
			<Reader book={'MAT'}/>
			<a className="dragbar" />
			<Reader book={'JUD'}/>
		</main>
	</Fragment>
);

render(element, document.body);
