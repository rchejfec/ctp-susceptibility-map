<script>
	/**
	 * Test Page 3: Two-Row Complex Layout
	 *
	 * Map + Controls (Row 1) | Info + Bar Chart + Scatter Plot (Row 2)
	 */
	import MapPage from '$lib/components/MapPage.svelte';
	import { config2Row } from '$lib/config/testConfigs.js';

	export let data;
</script>

<MapPage {data} config={config2Row} />
