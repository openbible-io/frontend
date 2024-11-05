<script lang="ts">
import { writable } from 'svelte/store';

const count = writable(0);
console.log($count); // logs 0

count.set(1);
console.log($count); // logs 1

$count = 2;
console.log($count); // logs 2

const increment = () => {
	count.set($count + 2);
};
</script>

<button onclick={increment}>
	count is {$count}
</button>

<style>
button {
	color: purple;
}
</style>
