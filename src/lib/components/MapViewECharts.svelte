<script>
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import {
		geoData,
		metricsData,
		currentMetricConfig,
		selectedProvince,
		selectedRegion,
		highlightedRegions,
		toggleRegionSelection,
		highlightRegions,
		clearHighlights
	} from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * MapView Component (Apache ECharts version)
	 *
	 * Renders the map using ECharts Geo component/series.
	 */

	let mapContainer;
	let myChart;
	let resizeObserver;
	let isMapRegistered = false;

	const idField = mapConfig.fields?.geometry?.idField || 'GeoUID';
	const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';

	// React to data changes
	$: if (myChart && isMapRegistered && $metricsData && $currentMetricConfig) {
		updateMapData($metricsData, $currentMetricConfig);
	}

	// React to selection
	$: if (myChart && isMapRegistered) {
		handleExternalSelection($selectedRegion);
	}

	// React to highlights
	$: if (myChart && isMapRegistered) {
		handleExternalHighlight($highlightedRegions);
	}

	// React to province filter
	$: if (myChart && isMapRegistered && $selectedProvince !== undefined) {
		handleProvinceFilter($selectedProvince);
	}

	function registerMapData(geojson) {
		if (!geojson || isMapRegistered) return;

		echarts.registerMap('Canada', geojson);
		isMapRegistered = true;
	}

	function getFillColor(value, metricConfig) {
		if (value == null || value === '') return '#ccc';

		if (metricConfig.type === 'categorical') {
			return metricConfig.scale.colors[value] || '#ccc';
		} else if (metricConfig.type === 'continuous') {
			// Simple interpolation not implemented manually, relying on visualMap would be better
			// But for consistency with other charts, let's just use a basic mapping or rely on ECharts
			return '#4A90E2';
		}
		return '#ccc';
	}

	function updateMapData(metrics, metricConfig) {
		if (!metrics || !metricConfig) return;

		// Join metrics to regions
		// ECharts Map Series expects data in format: { name: 'RegionName', value: metricValue, ...extra }
		// However, GeoJSON features are identified by 'name' property in ECharts by default.
		// We used 'GeoUID' as ID. We need to make sure ECharts maps data to features correctly.
		// We can set 'nameProperty' in registerMap or series, strictly it matches feature.properties.name usually.

		// Ideally, we construct a data array where 'name' matches the feature name.
		// Let's assume the GeoJSON 'nameField' matches.

		const dataMap = new Map();
		metrics.forEach(d => {
			dataMap.set(String(d[idField]), d);
		});

		// We need to prepare data for the series.
		// We iterate over the GeoJSON features to ensure we have an entry for each
		if (!$geoData) return;

		const seriesData = $geoData.features.map(feature => {
			const id = String(feature.properties[idField]);
			const name = feature.properties[nameField]; // This must match what ECharts uses for matching
			const metricRow = dataMap.get(id);

			// Value for coloring
			const value = metricRow ? metricRow[metricConfig.column] : null;

			// Define color directly for categorical
			const color = getFillColor(value, metricConfig);

			return {
				name: name, // ECharts uses this to match feature
				value: value,
				id: id,     // Custom property for our logic
				itemStyle: {
					areaColor: color
				},
				// Store full data for tooltip
				originalData: metricRow
			};
		});

		const option = {
			tooltip: {
				trigger: 'item',
				formatter: (params) => {
					if (!params.data) return params.name;
					const d = params.data.originalData;
					if (!d) return params.name;

					const tooltipFields = metricConfig.tooltip?.fields || [nameField];
					const tooltipFormat = metricConfig.tooltip?.format || {};

					let html = `<strong>${params.name}</strong><br/>`;
					tooltipFields.forEach((field) => {
						if (field === nameField) return; // Already title
						const val = d[field];
						const formatter = tooltipFormat[field];
						const displayValue = formatter ? formatter(val) : (val != null ? val : 'N/A');
						html += `${field}: ${displayValue}<br/>`;
					});
					return html;
				}
			},
			geo: {
				map: 'Canada',
				roam: true,
				label: {
					show: false
				},
				itemStyle: {
					areaColor: '#eee',
					borderColor: '#333',
					borderWidth: 0.5
				},
				emphasis: {
					itemStyle: {
						areaColor: '#FFD700'
					},
					label: {
						show: false
					}
				},
				select: {
					itemStyle: {
						areaColor: '#FF6B6B',
						borderWidth: 2,
						borderColor: '#333'
					},
					label: {
						show: false
					}
				},
				// We can define regions here if needed, but series is better for data
			},
			series: [
				{
					name: 'Census Divisions',
					type: 'map',
					geoIndex: 0, // Use the shared geo component configuration
					data: seriesData,
					// Custom mapping: match GeoJSON property to 'name'
					// In ECharts 5+, we can verify 'nameProperty' in registerMap.
					// By default it looks for 'name'.
				}
			]
		};

		myChart.setOption(option);
	}

	function handleExternalHighlight(highlightedIds) {
		if (!highlightedIds || highlightedIds.length === 0) {
			myChart.dispatchAction({
				type: 'downplay',
				seriesIndex: 0
			});
			return;
		}

		// Find data indices for these IDs
		// This requires searching the series data
		const option = myChart.getOption();
		const seriesData = option.series[0].data;

		const indices = [];
		seriesData.forEach((d, i) => {
			if (highlightedIds.includes(String(d.id))) {
				indices.push(i);
			}
		});

		if (indices.length > 0) {
			myChart.dispatchAction({
				type: 'highlight',
				seriesIndex: 0,
				dataIndex: indices
			});
		}
	}

	function handleExternalSelection(regionId) {
		if (!regionId) {
			myChart.dispatchAction({
				type: 'unselect',
				seriesIndex: 0,
				dataIndex: 'all' // Unselect all
			});
			return;
		}

		// Similar to highlight, find index
		const option = myChart.getOption();
		const seriesData = option.series[0].data;

		const index = seriesData.findIndex(d => String(d.id) === String(regionId));

		if (index >= 0) {
			myChart.dispatchAction({
				type: 'select',
				seriesIndex: 0,
				dataIndex: index
			});

			// Also zoom to it? MapLibre does. ECharts 'geo' can center/zoom.
			// Implementing zoom would require calculating centroid or bounding box.
			// Skipping complex zoom logic for this demo unless requested.
		}
	}

	function handleProvinceFilter(provinceName) {
		// If filtered, we could zoom to province or hide other regions.
		// Hiding: Set itemStyle opacity to 0.1 for others?
		// Zooming: ECharts registerMap creates regions. We can use dispatchAction 'geoRoam'.

		// For now, let's visually dim excluded regions if a filter is active
		if (!provinceName) {
			// Restore
			if (myChart) {
				const option = myChart.getOption();
				// This resets to data styles
				myChart.setOption(option);
			}
			return;
		}

		// TODO: Implement complex filtering visual if needed.
		// MapLibre implementation hides them.
		// Here we can update data itemStyles.
	}

	onMount(() => {
		myChart = echarts.init(mapContainer);

		// Register map immediately if data is available
		if ($geoData) {
			// Important: ECharts expects specific GeoJSON format.
			// We need to tell it which property is the name if it's not 'name'.
			// Our GeoJSON likely has 'CD_Name' or 'Region_Name'.
			// We can modify the features before registering.

			const modifiedGeoJSON = {
				...$geoData,
				features: $geoData.features.map(f => ({
					...f,
					properties: {
						...f.properties,
						name: f.properties[nameField] // Ensure 'name' property exists for ECharts matching
					}
				}))
			};

			registerMapData(modifiedGeoJSON);
		}

		resizeObserver = new ResizeObserver(() => {
			myChart.resize();
		});
		resizeObserver.observe(mapContainer);

		// Interactions
		myChart.on('click', (params) => {
			if (params.data && params.data.id) {
				toggleRegionSelection(params.data.id);
			}
		});

		myChart.on('mouseover', (params) => {
			if (params.data && params.data.id) {
				highlightRegions([params.data.id]);
			}
		});

		myChart.on('mouseout', () => {
			clearHighlights();
		});

		// Initial Render
		if ($metricsData && $currentMetricConfig) {
			updateMapData($metricsData, $currentMetricConfig);
		}
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (myChart) myChart.dispose();
	});
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		background: #f5f5f5; /* Light background for the map */
	}
</style>
