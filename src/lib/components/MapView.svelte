<script>
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import {
		selectedProvince,
		selectedRegion,
		highlightedRegions,
		mapInstance,
		geoData,
		metricsData,
		filteredMetrics,
		currentMetricConfig,
		clearSelectionIfFiltered,
		toggleRegionSelection,
		isRegionGroup,
		getRegionGroupIds
	} from '$lib/stores/mapStore.js';
	import { mapConfig, provinceNames } from '$lib/mapConfig.js';

	/**
	 * MapView Component
	 *
	 * Main map component using MapLibre GL JS
	 * Supports multi-metric visualization and linked highlighting
	 */

	let mapContainer;
	let map;
	let popup;
	let mapReady = false;

	// Track previous selection for zoom logic
	let previousSelection = null;

	// Get field names from config
	const idField = mapConfig.fields?.geometry?.idField || 'GeoUID';
	const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';
	const provinceField = mapConfig.fields?.geometry?.provinceField || 'Province';

	// Process data when loaded
	$: if ($geoData && $metricsData) {
		processData();
	}

	// React to metric changes
	$: if (mapReady && $currentMetricConfig) {
		updateMapColors($currentMetricConfig);
	}

	// React to filter changes
	$: if (mapReady) {
		updateMapFilters($selectedProvince);
		// Clear selection if filtered out
		clearSelectionIfFiltered($selectedRegion, $filteredMetrics, mapConfig);
	}

	// React to selection changes
	$: if (mapReady) {
		updateMapSelection($selectedRegion);
	}

	// React to highlighted regions
	$: if (mapReady && $highlightedRegions) {
		updateMapHighlight($highlightedRegions);
	}

	// Reactive: Zoom on selection change
	$: if (mapReady && map) {
		handleSelectionZoom($selectedRegion, $selectedProvince);
	}

	function handleSelectionZoom(regionId, provinceFilter) {
		// New selection - zoom to region
		if (regionId && regionId !== previousSelection) {
			fitToRegion(regionId);
		}
		// Deselection - zoom back to context
		else if (!regionId && previousSelection) {
			if (provinceFilter) {
				fitToProvince(provinceFilter);
			} else {
				fitToCanada();
			}
		}

		previousSelection = regionId;
	}

	function processData() {
		if (!$geoData || !$metricsData) return;

		// Join CSV metrics to GeoJSON features
		const dataLookup = new Map($metricsData.map((d) => [String(d[idField]), d]));

		$geoData.features.forEach((feature) => {
			const uid = feature.properties[idField];
			const metric = dataLookup.get(String(uid));
			if (metric) {
				feature.properties = { ...feature.properties, ...metric };
			}
		});

		// Initialize map if not already done
		if (!map && mapContainer) {
			initMap();
		} else if (map && map.getSource('census-divisions')) {
			// Update existing map source with joined data
			map.getSource('census-divisions').setData($geoData);
			// Force color update after data refresh
			if ($currentMetricConfig) {
				updateMapColors($currentMetricConfig);
			}
		}
	}

	function initMap() {
		// Create map instance with empty style
		map = new maplibregl.Map({
			container: mapContainer,
			style: {
				version: 8,
				sources: {},
				layers: []
			}
		});

		// Create popup
		popup = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false
		});

		// Store map instance
		mapInstance.set(map);

		map.on('load', () => {
			// Add GeoJSON source
			map.addSource('census-divisions', {
				type: 'geojson',
				data: $geoData
			});

			// Add fill layer
			map.addLayer({
				id: 'cd-fill',
				type: 'fill',
				source: 'census-divisions',
				paint: {
					'fill-color': getFillColorExpression($currentMetricConfig),
					'fill-opacity': mapConfig.style.fillOpacity
				}
			});

			// Add border layer
			map.addLayer({
				id: 'cd-border',
				type: 'line',
				source: 'census-divisions',
				paint: {
					'line-color': mapConfig.style.borderColor,
					'line-width': mapConfig.style.borderWidth
				}
			});

			// Add highlight layer (for linked highlighting from charts)
			map.addLayer({
				id: 'cd-highlighted',
				type: 'line',
				source: 'census-divisions',
				paint: {
					'line-color': mapConfig.style.highlightedBorderColor,
					'line-width': mapConfig.style.highlightedBorderWidth
				},
				filter: ['==', ['get', idField], '']
			});

			// Add selection highlight layer
			map.addLayer({
				id: 'cd-selected',
				type: 'line',
				source: 'census-divisions',
				paint: {
					'line-color': mapConfig.style.selectedBorderColor,
					'line-width': mapConfig.style.selectedBorderWidth
				},
				filter: ['==', ['get', idField], '']
			});

			// Fit map to Canada bounds from config
			fitToCanada();

			// Add event listeners
			map.on('click', 'cd-fill', handleMapClick);
			map.on('mousemove', 'cd-fill', handleMouseMove);
			map.on('mouseleave', 'cd-fill', handleMouseLeave);

			// Change cursor on hover
			map.on('mouseenter', 'cd-fill', () => {
				map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'cd-fill', () => {
				map.getCanvas().style.cursor = '';
			});

			// Mark map as ready
			mapReady = true;
		});
	}

	/**
	 * Fit map viewport to all of Canada
	 */
	function fitToCanada() {
		map.fitBounds(mapConfig.viewport.bounds, {
			padding: mapConfig.viewport.padding,
			maxZoom: mapConfig.viewport.maxZoom,
			duration: 1000
		});
	}

	function getFillColorExpression(metricConfig) {
		if (!metricConfig) return '#cccccc';

		if (metricConfig.type === 'continuous') {
			// Interpolated color scale
			const expression = ['interpolate', ['linear'], ['get', metricConfig.column]];
			metricConfig.scale.colors.forEach(([value, color]) => {
				expression.push(value, color);
			});
			return expression;
		} else if (metricConfig.type === 'categorical') {
			// Categorical scale - match category values to colors
			const expression = ['match', ['get', metricConfig.column]];
			metricConfig.scale.categories.forEach((category) => {
				const color = metricConfig.scale.colors[category];
				expression.push(category, color);
			});
			expression.push('#cccccc'); // Default color
			return expression;
		}

		return '#cccccc';
	}

	function updateMapColors(metricConfig) {
		if (!map || !map.getLayer('cd-fill')) return;

		map.setPaintProperty('cd-fill', 'fill-color', getFillColorExpression(metricConfig));
	}

	function handleMapClick(e) {
		if (e.features && e.features.length > 0) {
			const feature = e.features[0];
			const geoId = String(feature.properties[idField]);

			// Toggle selection using store action
			toggleRegionSelection(geoId);
		}
	}

	function handleMouseMove(e) {
		if (e.features && e.features.length > 0 && $currentMetricConfig) {
			const feature = e.features[0];

			// Build tooltip content based on current metric config
			const tooltipFields = $currentMetricConfig.tooltip?.fields || [nameField];
			const tooltipFormat = $currentMetricConfig.tooltip?.format || {};

			let html = '';
			tooltipFields.forEach((field) => {
				const value = feature.properties[field];
				const formatter = tooltipFormat[field];
				const displayValue = formatter ? formatter(value) : value;
				html += `<div><strong>${field}:</strong> ${displayValue}</div>`;
			});

			popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
		}
	}

	function handleMouseLeave() {
		popup.remove();
	}

	function updateMapFilters(filterValue) {
		if (!map || !map.getLayer('cd-fill')) return;

		if (filterValue) {
			let filter;

			// Check if it's a region group
			if (isRegionGroup(filterValue)) {
				const group = mapConfig.regionGroups?.groups?.[filterValue];
				if (group) {
					// INVERSE filter: Show province EXCEPT excluded CDs
					filter = [
						'all',
						['==', ['get', 'Province_Name'], group.provinceName],
						['!', ['in', ['to-string', ['get', idField]], ['literal', group.excludeRegions]]]
					];
				}
			} else {
				// Regular province filter
				filter = ['==', ['get', 'Province_Name'], filterValue];
			}

			// Apply filters to all layers
			map.setFilter('cd-fill', filter);
			map.setFilter('cd-border', filter);
			map.setFilter('cd-highlighted', ['all', filter, ['==', ['get', idField], '']]);
			map.setFilter('cd-selected', ['all', filter, ['==', ['get', idField], '']]);

			// Zoom appropriately
			if (isRegionGroup(filterValue)) {
				fitToRegionGroup(filterValue);
			} else {
				fitToProvince(filterValue);
			}
		} else {
			// Show all regions
			map.setFilter('cd-fill', null);
			map.setFilter('cd-border', null);
			map.setFilter('cd-highlighted', ['==', ['get', idField], '']);
			map.setFilter('cd-selected', ['==', ['get', idField], '']);

			// Reset to full Canada view
			fitToCanada();
		}
	}

	function updateMapSelection(regionId) {
		if (!map || !map.getLayer('cd-selected')) return;

		if (regionId) {
			// Highlight selected region
			let filter = ['==', ['to-string', ['get', idField]], String(regionId)];

			// If province/region group filter is active, combine filters
			if ($selectedProvince) {
				// Check if it's a region group
				if (isRegionGroup($selectedProvince)) {
					const group = mapConfig.regionGroups?.groups?.[$selectedProvince];
					if (group) {
						filter = [
							'all',
							['==', ['get', 'Province_Name'], group.provinceName],
							['!', ['in', ['to-string', ['get', idField]], ['literal', group.excludeRegions]]],
							['==', ['to-string', ['get', idField]], String(regionId)]
						];
					}
				} else {
					// Regular province filter
					filter = [
						'all',
						['==', ['get', 'Province_Name'], $selectedProvince],
						['==', ['to-string', ['get', idField]], String(regionId)]
					];
				}
			}

			map.setFilter('cd-selected', filter);
		} else {
			// Clear selection
			const baseFilter = $selectedProvince ? ['==', ['get', 'Province_Name'], $selectedProvince] : null;
			map.setFilter('cd-selected', ['all', baseFilter || true, ['==', ['get', idField], '']]);
		}
	}

	function updateMapHighlight(highlightedIds) {
		if (!map || !map.getLayer('cd-highlighted')) return;

		if (highlightedIds && highlightedIds.length > 0) {
			// Build filter for highlighted regions
			const filter = ['in', ['to-string', ['get', idField]], ['literal', highlightedIds.map(String)]];

			// If province filter is active, combine filters
			if ($selectedProvince) {
				const combinedFilter = ['all', ['==', ['get', 'Province_Name'], $selectedProvince], filter];
				map.setFilter('cd-highlighted', combinedFilter);
			} else {
				map.setFilter('cd-highlighted', filter);
			}
		} else {
			// Clear highlights
			map.setFilter('cd-highlighted', ['==', ['get', idField], '']);
		}
	}

	/**
	 * Fit map viewport to a specific province
	 */
	function fitToProvince(provinceName) {
		if (!$geoData) return;

		const provinceFeatures = $geoData.features.filter(
			(f) => f.properties.Province_Name === provinceName
		);

		if (provinceFeatures.length === 0) return;

		// Calculate bounding box of province
		let minLng = Infinity,
			minLat = Infinity,
			maxLng = -Infinity,
			maxLat = -Infinity;

		provinceFeatures.forEach((feature) => {
			const coordinates = feature.geometry.coordinates;

			// Handle MultiPolygon
			const polygons = feature.geometry.type === 'MultiPolygon' ? coordinates : [coordinates];

			polygons.forEach((polygon) => {
				polygon[0].forEach(([lng, lat]) => {
					minLng = Math.min(minLng, lng);
					minLat = Math.min(minLat, lat);
					maxLng = Math.max(maxLng, lng);
					maxLat = Math.max(maxLat, lat);
				});
			});
		});

		map.fitBounds([minLng, minLat, maxLng, maxLat], {
			padding: mapConfig.viewport.provincePadding,
			maxZoom: mapConfig.viewport.provinceMaxZoom,
			duration: 1000
		});
	}

	/**
	 * Fit map viewport to a region group (using inverse filtering)
	 */
	function fitToRegionGroup(groupId) {
		if (!$geoData) return;

		const group = mapConfig.regionGroups?.groups?.[groupId];
		if (!group) return;

		const idField = mapConfig?.fields?.geometry?.idField || 'GeoUID';

		// Find all features in this region group (province EXCEPT excluded CDs)
		const groupFeatures = $geoData.features.filter((f) => {
			const isInProvince = f.properties.Province_Name === group.provinceName;
			const isExcluded = group.excludeRegions.includes(String(f.properties[idField]));
			return isInProvince && !isExcluded;
		});

		if (groupFeatures.length === 0) return;

		// Calculate bounding box
		let minLng = Infinity,
			minLat = Infinity;
		let maxLng = -Infinity,
			maxLat = -Infinity;

		groupFeatures.forEach((feature) => {
			const coordinates = feature.geometry.coordinates;
			const polygons = feature.geometry.type === 'MultiPolygon' ? coordinates : [coordinates];

			polygons.forEach((polygon) => {
				polygon[0].forEach(([lng, lat]) => {
					minLng = Math.min(minLng, lng);
					minLat = Math.min(minLat, lat);
					maxLng = Math.max(maxLng, lng);
					maxLat = Math.max(maxLat, lat);
				});
			});
		});

		map.fitBounds([minLng, minLat, maxLng, maxLat], {
			padding: mapConfig.viewport.provincePadding || 50,
			maxZoom: mapConfig.viewport.provinceMaxZoom || 7,
			duration: 800,
			linear: true
		});
	}

	/**
	 * Fit map to a specific region with surrounding context
	 * Shows region centered with ~30-40% surrounding area
	 */
	function fitToRegion(regionId) {
		if (!$geoData || !regionId) return;

		const idField = mapConfig?.fields?.geometry?.idField || 'GeoUID';
		const feature = $geoData.features.find(
			(f) => String(f.properties[idField]) === String(regionId)
		);

		if (!feature) return;

		// Calculate tight bounding box
		const coordinates = feature.geometry.coordinates;
		const polygons = feature.geometry.type === 'MultiPolygon' ? coordinates : [coordinates];

		let minLng = Infinity,
			minLat = Infinity;
		let maxLng = -Infinity,
			maxLat = -Infinity;

		polygons.forEach((polygon) => {
			polygon[0].forEach(([lng, lat]) => {
				minLng = Math.min(minLng, lng);
				minLat = Math.min(minLat, lat);
				maxLng = Math.max(maxLng, lng);
				maxLat = Math.max(maxLat, lat);
			});
		});

		// Expand bbox by 50% on all sides (gives ~33% adjacent context)
		const lngDelta = (maxLng - minLng) * 0.5;
		const latDelta = (maxLat - minLat) * 0.5;

		const expandedBbox = [minLng - lngDelta, minLat - latDelta, maxLng + lngDelta, maxLat + latDelta];

		// Only zoom if it would zoom IN, not out
		const currentZoom = map.getZoom();
		const targetMaxZoom = 5;

		if (currentZoom < targetMaxZoom) {
			map.fitBounds(expandedBbox, {
				padding: 50,
				minZoom: 4,
				maxZoom: 5,
				duration: 800,
				linear: true
			});
		}
		// Otherwise, selection happens without zoom change
	}

	onMount(() => {
		// Map will be initialized when data is ready
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.css" />
</svelte:head>

<div class="map-container" bind:this={mapContainer}></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
	}
</style>
