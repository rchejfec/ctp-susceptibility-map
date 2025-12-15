<script>
	/**
	 * Reusable Map Page Component
	 *
	 * Used by all test pages with different configs
	 */
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { base } from '$app/paths';
	import { geoData, metricsData, supplementaryData } from '$lib/stores/mapStore.js';
	import { provinceNames } from '$lib/mapConfig.js';
	import {
		getFullConfig,
		getRow2Components,
		getRow2GridTemplate,
		shouldShowRow2
	} from '$lib/config/helpers.js';
	import MapView from '$lib/components/MapView.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import ProvinceFilter from '$lib/components/ProvinceFilter.svelte';
	import DetailPanel from '$lib/components/DetailPanel.svelte';
	import DetailPanel2 from '$lib/components/DetailPanel2.svelte';
	import MetricSwitcher from '$lib/components/MetricSwitcher.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import ScatterPlot from '$lib/components/ScatterPlot.svelte';

	/** @type {object} - Configuration object for this map */
	export let config;

	/** @type {{geoData: any, metrics: any[]}} - Data from server */
	export let data;

	/** @type {any} - Optional Map Component override */
	export let mapComponent = MapView;

	$: if (data?.error) {
		console.error('Error loading data:', data.error);
	}

	// Get full config with defaults applied
	$: fullConfig = getFullConfig(config);

	// Create a reactive context store for the config
	const configStore = writable(fullConfig);
	$: configStore.set(fullConfig);

	// Provide config store to child components via context
	setContext('mapConfig', configStore);

	let isLoadingGeoData = false;
	let geoDataError = null;

	onMount(async () => {
		// Set metrics data immediately
		if (data?.metrics) {
			// Add province names to metrics BEFORE setting in store
			data.metrics.forEach((d) => {
				d.Province_Name = provinceNames[String(d.Province)] || 'Unknown';
			});
			metricsData.set(data.metrics);

			// Load supplementary data if provided
			if (data.supplementary) {
				supplementaryData.set(data.supplementary);
			}
		}

		// Load large GeoJSON client-side to avoid SSR bloat
		if (data?.geoDataUrl) {
			isLoadingGeoData = true;
			try {
				// Use base path for proper routing
				const url = `${base}${data.geoDataUrl}`;
				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
				}
				const geojson = await response.json();
				geoData.set(geojson);
			} catch (error) {
				console.error('Error loading GeoJSON:', error);
				geoDataError = error.message;
			} finally {
				isLoadingGeoData = false;
			}
		}
	});

	// Feature toggles from config
	$: metricSwitcherEnabled = fullConfig.features?.metricSwitcher?.enabled ?? true;
	$: searchBarEnabled = fullConfig.features?.searchBar?.enabled ?? true;
	$: provinceFilterEnabled = fullConfig.features?.provinceFilter?.enabled ?? true;
	$: legendEnabled = fullConfig.features?.legend?.enabled ?? true;
	$: infoCardEnabled = fullConfig.features?.infoCard?.enabled ?? true;

	// Layout mode
	$: layoutMode = fullConfig.layout?.mode || 'sidebar';
	$: isTwoColumnMode = layoutMode === 'two-column';

	// Layout configuration
	$: infoCardInSidebar =
		!isTwoColumnMode && fullConfig.layout.row1.infoCardPlacement === 'row1-sidebar';
	$: showRow2 = isTwoColumnMode || shouldShowRow2(config);
	$: row2Components = getRow2Components(config);
	$: row2GridTemplate = getRow2GridTemplate(config);


	// Charts enabled (for backward compatibility)
	$: barChartEnabled = fullConfig.charts?.barChart?.enabled ?? false;
	$: scatterChartEnabled = fullConfig.charts?.scatterChart?.enabled ?? false;
</script>

<svelte:head>
	<title>{config.project?.title || 'Map Visualization'}</title>
</svelte:head>

<div class="container">
	<header>
		<h1>{config.project?.title || 'Map Visualization'}</h1>
		{#if config.project?.subtitle}
			<p class="subtitle">{config.project.subtitle}</p>
		{/if}
		{#if isLoadingGeoData}
			<p class="loading-indicator">Loading map data...</p>
		{/if}
		{#if geoDataError}
			<p class="error-indicator">Error: {geoDataError}</p>
		{/if}
	</header>

	<!-- LAYOUT: Conditional based on mode -->
	{#if isTwoColumnMode}
		<!-- TWO-COLUMN MODE: Map (left, full height) + Stacked Components (right, full height) -->
		<div class="two-column-grid">
			<!-- Left: Map -->
			<div class="map-section">
				<svelte:component this={mapComponent} />
				{#if legendEnabled}
					<div class="legend-overlay">
						<Legend />
					</div>
				{/if}
			</div>

			<!-- Right: Stacked Components (controls, info, charts) -->
			<div class="right-column">
				<!-- Controls Card -->
				<div class="sidebar-section filters-card">
					<h2>Controls</h2>
					<div class="filter-controls">
						{#if searchBarEnabled}
							<SearchBar />
						{/if}
						{#if metricSwitcherEnabled && config.metrics && config.metrics.length > 1}
							<MetricSwitcher />
						{/if}
						{#if provinceFilterEnabled}
							<ProvinceFilter />
						{/if}
					</div>
				</div>

				<!-- Render components in order -->
				{#each row2Components as component (component.type)}
					{#if component.type === 'infoCard' && infoCardEnabled}
						<div class="sidebar-section details-card">
							<DetailPanel />
						</div>
					{:else if component.type === 'infoCard2'}
						<div class="sidebar-section details-card">
							<DetailPanel2 />
						</div>
					{:else if component.type === 'barChart' && barChartEnabled}
						<div class="sidebar-section chart-card">
							<BarChart />
						</div>
					{:else if component.type === 'scatterChart' && scatterChartEnabled}
						<div class="sidebar-section chart-card">
							<ScatterPlot />
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<!-- SIDEBAR MODE: Map + Sidebar (Row 1), optional Row 2 below -->
		<div class="main-grid">
			<div class="map-section">
				<svelte:component this={mapComponent} />
				{#if legendEnabled}
					<div class="legend-overlay">
						<Legend />
					</div>
				{/if}
			</div>

			<div class="sidebar">
				<!-- Controls Card -->
				<div class="sidebar-section filters-card">
					<h2>Controls</h2>
					<div class="filter-controls">
						{#if searchBarEnabled}
							<SearchBar />
						{/if}
						{#if metricSwitcherEnabled && config.metrics && config.metrics.length > 1}
							<MetricSwitcher />
						{/if}
						{#if provinceFilterEnabled}
							<ProvinceFilter />
						{/if}
					</div>
				</div>

				<!-- Info Card (conditionally in sidebar) -->
				{#if infoCardEnabled && infoCardInSidebar}
					<div class="sidebar-section details-card">
						<DetailPanel />
					</div>
				{/if}
			</div>
		</div>

		<!-- ROW 2: Charts and/or Info Card -->
		{#if showRow2}
			<div class="row2-section" style="grid-template-columns: {row2GridTemplate};">
				{#each row2Components as component (component.type)}
					{#if component.type === 'infoCard' && infoCardEnabled}
						<div
							class="row2-component info-card-wrapper"
							style="justify-self: {component.align || 'center'}; max-width: {component.maxWidth ||
								'100%'};"
						>
							<div class="sidebar-section details-card">
								<DetailPanel />
							</div>
						</div>
					{:else if component.type === 'infoCard2'}
						<div class="row2-component info-card-wrapper" style="justify-self: start; max-width: 100%;">
							<div class="sidebar-section details-card">
								<DetailPanel2 />
							</div>
						</div>
					{:else if component.type === 'barChart' && barChartEnabled}
						<div class="row2-component">
							<div class="sidebar-section">
								<BarChart />
							</div>
						</div>
					{:else if component.type === 'scatterChart' && scatterChartEnabled}
						<div class="row2-component">
							<div class="sidebar-section">
								<ScatterPlot />
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(html, body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
		background-color: #f5f5f5;
		height: 100%;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	header {
		background: white;
		border-bottom: 1px solid #e0e0e0;
		padding: 1rem 1.5rem;
		flex-shrink: 0;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
	}

	.subtitle {
		margin: 0.25rem 0 0 0;
		font-size: 0.875rem;
		color: #666;
	}

	.loading-indicator {
		margin: 0.5rem 0 0 0;
		font-size: 0.875rem;
		color: #4A90E2;
		font-weight: 500;
	}

	.error-indicator {
		margin: 0.5rem 0 0 0;
		font-size: 0.875rem;
		color: #d32f2f;
		font-weight: 500;
	}

	/* ========================================
	   SIDEBAR MODE LAYOUT
	   ======================================== */
	.main-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 1rem;
		padding: 1rem 1.5rem;
		overflow: hidden;
		min-height: 0;
	}

	/* ========================================
	   TWO-COLUMN MODE LAYOUT
	   ======================================== */
	.two-column-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 1rem;
		padding: 1rem 1.5rem;
		overflow: hidden;
		min-height: 0;
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.chart-card {
		/* Chart cards in two-column mode */
		flex-shrink: 0;
	}

	.map-section {
		position: relative;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.legend-overlay {
		position: absolute;
		bottom: 20px;
		right: 20px;
		background: rgba(255, 255, 255, 0.85);
		padding: 0.75rem;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		z-index: 10;
		backdrop-filter: blur(5px);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 0;
		/* NO SCROLLING - components move to Row 2 if they don't fit */
		overflow: visible;
	}

	.sidebar-section {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 1rem;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
	}

	.filters-card .filter-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.details-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem; /* Match filters-card padding */
	}

	/* Standardized card headers */
	h2 {
		font-size: 1rem;
		margin: 0 0 0.75rem 0;
		font-weight: 600;
		color: #333;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.5rem;
		flex-shrink: 0;
	}

	/* Chart/figure cards have consistent styling */
	.sidebar-section :global(h3.chart-title) {
		font-size: 1rem;
		margin: 0 0 0.75rem 0;
		font-weight: 600;
		color: #333;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.5rem;
		flex-shrink: 0;
	}

	/* ========================================
	   ROW 2 SECTION
	   ======================================== */
	.row2-section {
		display: grid;
		gap: 1rem;
		padding: 0 1.5rem 1rem 1.5rem;
		flex-shrink: 0;
		/* grid-template-columns is set inline via style attribute */
	}

	.row2-component {
		min-width: 0; /* Allow grid items to shrink below content size */
	}

	.info-card-wrapper {
		/* Wrapper for info card when in Row 2 */
		width: 100%;
	}

	/* ========================================
	   RESPONSIVE BREAKPOINTS
	   ======================================== */
	@media (max-width: 1200px) {
		.container {
			height: auto;
			min-height: 100%;
		}

		/* Stack map and sidebar vertically (sidebar mode) */
		.main-grid {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(400px, 65vh) auto;
			flex: 1 0 auto;
		}

		/* Stack two-column mode vertically */
		.two-column-grid {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(400px, 65vh) auto;
			flex: 1 0 auto;
		}

		/* Sidebar no longer scrolls (never scrolls!) */
		.sidebar {
			overflow: visible;
		}

		/* Right column can scroll on tablet/mobile */
		.right-column {
			overflow-y: visible;
		}

		/* Row 2 stacks on tablet */
		.row2-section {
			grid-template-columns: 1fr !important; /* Override inline style */
			gap: 0.75rem;
		}
	}

	@media (max-width: 768px) {
		/* Smaller map on mobile */
		.main-grid,
		.two-column-grid {
			grid-template-rows: minmax(300px, 60vh) auto;
			padding: 0.5rem;
			gap: 0.5rem;
		}

		/* Row 2 stacks with tighter spacing */
		.row2-section {
			padding: 0 0.5rem 0.5rem 0.5rem;
			grid-template-columns: 1fr !important;
			gap: 0.5rem;
		}

		/* Right column tighter spacing on mobile */
		.right-column {
			gap: 0.5rem;
		}

		header {
			padding: 0.75rem 1rem;
		}

		h1 {
			font-size: 1.25rem;
		}
	}
</style>
