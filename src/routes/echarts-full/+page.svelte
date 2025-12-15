<script>
	import MapPage from '$lib/components/MapPage.svelte';
	import MapViewECharts from '$lib/components/MapViewECharts.svelte';
	import { mapConfig } from '$lib/mapConfig.js';

	/** @type {{geoData: any, metrics: any[]}} - Data from server */
	export let data;

	// Override config if needed, or use default
	const fullEChartsConfig = {
		...mapConfig,
		project: {
			...mapConfig.project,
			title: 'Full ECharts Dashboard',
			subtitle: 'Testing ECharts for Map, Bar Chart, and Scatter Plot'
		}
	};
</script>

<MapPage {data} config={fullEChartsConfig} mapComponent={MapViewECharts} />
