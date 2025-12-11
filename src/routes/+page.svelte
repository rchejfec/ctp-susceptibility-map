<script>
	/**
	 * CTP Susceptibility Map
	 *
	 * 2-row layout: Map + Sidebar | NAICS Table + Stacked Bar + Scatter
	 */
	import MapPage from '$lib/components/MapPage.svelte';
	import { mapConfig } from '$lib/mapConfig.js';

	export let data;
</script>

<MapPage {data} config={mapConfig} />
