<script>
	import "fluent-svelte/theme.css";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
</script>

<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<main>
	<slot />
</main>

<style>
	/* Some base styles to get things looking right. */
	:global(body) {
		background-color: var(--fds-solid-background-base);
		color: var(--fds-text-primary);
		margin: 0%;
		padding: 0%;
		width: 100%;
	}

	:global(h1, h2, h3, h4, h5, h6, p, span) {
		font-family: var(--fds-font-family-display) !important;
	}

</style>