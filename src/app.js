import { h, render, Fragment } from 'preact';
import './app.sass';

const element = (
	<Fragment>
		<h1>hello</h1>
		<h1>there</h1>
	</Fragment>
);

render(element, document.getElementById('root'));
