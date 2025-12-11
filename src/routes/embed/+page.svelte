<script>
	/**
	 * Embeddable Map Page (for iframes)
	 *
	 * Minimal version without header/title for embedding
	 */
	import MapPage from '$lib/components/MapPage.svelte';
	import { mapConfig } from '$lib/mapConfig.js';

	export let data;

	// Create embed-friendly config (no title/subtitle)
	const embedConfig = {
		...mapConfig,
		project: {
			...mapConfig.project,
			title: '', // No title for iframe
			subtitle: ''
		}
	};
</script>

<MapPage {data} config={embedConfig} />

<style>
	/* Remove any extra padding/margin for embed */
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
