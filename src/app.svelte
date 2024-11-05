<script lang="ts">
	import {Route} from 'tinro';
	import Index from './routes/index.svelte';
	import Book from './routes/book.svelte';
</script>

<header>
	<button>settings</button>
</header>

<Route path="/"><Index /></Route>
<Route path="/:pub/*">
	<Route path="/:book"><Book /></Route>
</Route>
