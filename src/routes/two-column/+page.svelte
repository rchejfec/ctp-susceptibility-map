<script>
	/**
	 * Test Page 2: Two-Column Layout
	 *
	 * Map (full height) + Controls + Info + Bar Chart (stacked right)
	 */
	import MapPage from '$lib/components/MapPage.svelte';
	import { config2Column } from '$lib/config/testConfigs.js';

	export let data;
</script>

<MapPage {data} config={config2Column} />
