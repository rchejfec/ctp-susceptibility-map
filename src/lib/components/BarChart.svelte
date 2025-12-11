<script>
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';
	import {
		filteredMetrics,
		currentMetricConfig,
		highlightRegions,
		clearHighlights,
		selectedRegion,
		highlightedRegions
	} from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * Bar Chart Component
	 *
	 * Horizontal or vertical bar chart with aggregated data
	 * Supports linked highlighting with map
	 */

	const chartConfig = mapConfig.charts?.barChart || {};
	const height = chartConfig.height || 300;
	const margin = { top: 20, right: 50, bottom: 50, left: 150 }; // Increased margins to prevent label overlap

	let container;
	let svg;
	let tooltip;

	$: if (container && $filteredMetrics && $currentMetricConfig) {
		renderChart($filteredMetrics, $currentMetricConfig);
	}

	$: if (svg && $highlightedRegions) {
		updateHighlight($highlightedRegions);
	}

	// React to map selection
	$: if (svg && $selectedRegion) {
		updateSelectionHighlight($selectedRegion);
	} else if (svg && !$selectedRegion) {
		clearSelectionHighlight();
	}

	/**
	 * Map metric ID to score column name
	 */
	function getScoreField(metricId) {
		const mapping = {
			import_susceptibility: 'IS',
			manufacturing_susceptibility: 'MS',
			fossil_fuel_susceptibility: 'FS',
			top_score: 'Top_Score'
		};
		return mapping[metricId] || 'Top_Score';
	}

	/**
	 * Aggregate data with share calculation by category (for stacked bars)
	 */
	function aggregateDataStacked(data, config) {
		const groupBy = chartConfig.groupBy;
		const aggColumn = chartConfig.aggregateColumn;
		const scoreField = getScoreField(config.id);

		// Group by province to calculate total PT labour force
		const provinceGroups = d3.group(data, (d) => d[groupBy]);
		const aggregated = [];

		provinceGroups.forEach((provinceData, provinceName) => {
			// Total labour force in this province
			const totalLabourForce = d3.sum(
				provinceData.map((d) => d[aggColumn]).filter((v) => v != null && !isNaN(v))
			);

			const categoryData = [];
			let totalShare = 0;

			// For each category (3, 4, 5), calculate share
			[3, 4, 5].forEach((category) => {
				// Filter CDs with this exact score
				const categoryRows = provinceData.filter((d) => d[scoreField] === category);

				// Sum labour force for this category
				const categoryLabourForce = d3.sum(
					categoryRows.map((d) => d[aggColumn]).filter((v) => v != null && !isNaN(v))
				);

				// Calculate share: category labour force / total PT labour force
				const share = totalLabourForce > 0 ? categoryLabourForce / totalLabourForce : 0;

				categoryData.push({
					category: category,
					value: share, // Percentage (0-1 scale)
					count: categoryRows.length,
					absoluteValue: categoryLabourForce,
					items: categoryRows
				});

				totalShare += share;
			});

			aggregated.push({
				group: provinceName,
				value: totalShare, // Total share for sorting
				categoryData: categoryData,
				items: provinceData // All items for highlighting
			});
		});

		// Sort by total share
		if (chartConfig.sort === 'descending') {
			aggregated.sort((a, b) => b.value - a.value);
		} else if (chartConfig.sort === 'ascending') {
			aggregated.sort((a, b) => a.value - b.value);
		}

		return aggregated;
	}

	function aggregateData(data, config) {
		const groupBy = chartConfig.groupBy;
		const aggColumn = config.column;
		const aggFunction = chartConfig.aggregateFunction || 'sum';

		// Check if we should use stacked aggregation
		if (aggFunction === 'share_by_category' && chartConfig.stacked) {
			return aggregateDataStacked(data, config);
		}

		const grouped = d3.group(data, (d) => d[groupBy]);
		const aggregated = [];

		grouped.forEach((values, key) => {
			let aggValue;
			const numericValues = values.map((d) => d[aggColumn]).filter((v) => v != null && !isNaN(v));

			if (aggFunction === 'sum') {
				aggValue = d3.sum(numericValues);
			} else if (aggFunction === 'mean') {
				aggValue = d3.mean(numericValues);
			} else if (aggFunction === 'median') {
				aggValue = d3.median(numericValues);
			} else if (aggFunction === 'count') {
				aggValue = values.length;
			}

			aggregated.push({
				group: key,
				value: aggValue,
				count: values.length,
				items: values
			});
		});

		// Sort
		if (chartConfig.sort === 'ascending') {
			aggregated.sort((a, b) => a.value - b.value);
		} else if (chartConfig.sort === 'descending') {
			aggregated.sort((a, b) => b.value - a.value);
		}

		return aggregated;
	}

	function renderChart(data, metricConfig) {
		if (!container) return;

		const width = container.clientWidth;
		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Clear existing
		d3.select(container).selectAll('*').remove();

		// Create SVG
		svg = d3
			.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Aggregate data
		const aggregated = aggregateData(data, metricConfig);
		const isStacked =
			chartConfig.stacked && chartConfig.aggregateFunction === 'share_by_category';

		// Scales
		const x = d3
			.scaleLinear()
			.domain([0, d3.max(aggregated, (d) => d.value)])
			.range([0, innerWidth])
			.nice();

		const y = d3
			.scaleBand()
			.domain(aggregated.map((d) => d.group))
			.range([0, innerHeight])
			.padding(0.2);

		// Axes
		const xAxis = d3.axisBottom(x).tickFormat(d3.format(chartConfig.xFormat || '~s'));
		const yAxis = d3.axisLeft(y);

		svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

		svg.append('g').attr('class', 'y-axis').call(yAxis);

		// Render bars (stacked or simple)
		if (isStacked) {
			renderStackedBars(svg, aggregated, x, y);
		} else {
			renderSimpleBars(svg, aggregated, x, y);
		}
	}

	/**
	 * Render simple (non-stacked) bars
	 */
	function renderSimpleBars(svg, aggregated, x, y) {
		const bars = svg
			.selectAll('.bar')
			.data(aggregated)
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('data-group', (d) => d.group)
			.attr('y', (d) => y(d.group))
			.attr('height', y.bandwidth())
			.attr('x', 0)
			.attr('width', (d) => x(d.value))
			.attr('fill', chartConfig.barColor || '#4A90E2')
			.on('mouseover', handleMouseOver)
			.on('mouseout', handleMouseOut)
			.on('click', handleClick);

		// Labels
		svg
			.selectAll('.bar-label')
			.data(aggregated)
			.enter()
			.append('text')
			.attr('class', 'bar-label')
			.attr('x', (d) => x(d.value) + 5)
			.attr('y', (d) => y(d.group) + y.bandwidth() / 2)
			.attr('dy', '0.35em')
			.attr('fill', '#666')
			.attr('font-size', '11px')
			.text((d) => d3.format(chartConfig.xFormat || '~s')(d.value));
	}

	/**
	 * Render stacked bars by category
	 */
	function renderStackedBars(svg, aggregated, x, y) {
		aggregated.forEach((d) => {
			let xOffset = 0;

			d.categoryData.forEach((catData) => {
				if (catData.value > 0) {
					const segmentWidth = x(catData.value);

					svg
						.append('rect')
						.attr('class', 'bar-segment')
						.attr('data-group', d.group)
						.attr('data-category', catData.category)
						.attr('y', y(d.group))
						.attr('height', y.bandwidth())
						.attr('x', xOffset)
						.attr('width', segmentWidth)
						.attr('fill', chartConfig.colors[catData.category] || '#999')
						.on('mouseover', function (event) {
							handleStackedMouseOver(event, d, catData);
						})
						.on('mouseout', handleMouseOut);

					xOffset += segmentWidth;
				}
			});
		});
	}

	/**
	 * Handle mouseover for stacked bar segments
	 */
	function handleStackedMouseOver(event, provinceData, categoryData) {
		if (!chartConfig.linkedHighlight) return;

		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';
		const regionIds = categoryData.items.map((item) => item[idField]);
		highlightRegions(regionIds);

		// Highlight segment
		d3.select(event.currentTarget).attr('opacity', 0.8);
	}

	function handleMouseOver(event, d) {
		if (!chartConfig.linkedHighlight) return;

		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';
		const regionIds = d.items.map((item) => item[idField]);
		highlightRegions(regionIds);

		// Highlight bar
		d3.select(event.currentTarget).attr('fill', chartConfig.highlightColor || '#FFD700');
	}

	function handleMouseOut(event) {
		clearHighlights();

		// Reset bar color
		d3.select(event.currentTarget).attr('fill', chartConfig.barColor || '#4A90E2');
	}

	function handleClick(event, d) {
		if (!chartConfig.clickToFilter) return;
		// Could implement filtering by clicking a bar
	}

	function updateHighlight(highlightedIds) {
		if (!svg) return;

		// Don't override selection highlight with hover
		if ($selectedRegion) return;

		// Reset all bars
		svg.selectAll('.bar').attr('fill', chartConfig.barColor || '#4A90E2').attr('opacity', 1);

		// Highlight bars that contain highlighted regions
		if (highlightedIds && highlightedIds.length > 0) {
			const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';

			svg.selectAll('.bar').attr('fill', function (d) {
				const hasHighlighted = d.items.some((item) => highlightedIds.includes(item[idField]));
				return hasHighlighted ? chartConfig.highlightColor || '#FFD700' : chartConfig.barColor || '#4A90E2';
			});
		}
	}

	function updateSelectionHighlight(regionId) {
		if (!svg || !regionId) return;

		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';

		// Find which province contains this region
		const selectedData = $filteredMetrics.find((item) => String(item[idField]) === String(regionId));

		if (!selectedData) return;

		const provinceName = selectedData.Province_Name;

		// Highlight the bar for this province (red)
		svg
			.selectAll('.bar')
			.attr('fill', (d) => (d.group === provinceName ? '#FF6B6B' : chartConfig.barColor || '#4A90E2'))
			.attr('opacity', (d) => (d.group === provinceName ? 1 : 0.3));
	}

	function clearSelectionHighlight() {
		if (!svg) return;

		svg.selectAll('.bar').attr('fill', chartConfig.barColor || '#4A90E2').attr('opacity', 1);
	}

	onMount(() => {
		if ($filteredMetrics && $currentMetricConfig) {
			renderChart($filteredMetrics, $currentMetricConfig);
		}
	});
</script>

<div class="bar-chart-container">
	<h3 class="chart-title">{$currentMetricConfig?.label || 'Metric'} {chartConfig.title || ''}</h3>
	<div bind:this={container} class="chart"></div>
</div>

<style>
	.bar-chart-container {
		/* No background/padding/shadow - parent .sidebar-section provides it */
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.chart-title {
		/* Title styling standardized in MapPage */
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #333;
		flex-shrink: 0;
	}

	.chart {
		width: 100%;
		overflow-x: auto;
		flex: 1;
	}

	:global(.bar) {
		cursor: pointer;
		transition: fill 0.2s;
	}

	:global(.x-axis),
	:global(.y-axis) {
		font-size: 11px;
	}

	:global(.x-axis path),
	:global(.y-axis path),
	:global(.x-axis line),
	:global(.y-axis line) {
		stroke: #999;
	}

	:global(.x-axis text),
	:global(.y-axis text) {
		fill: #666;
	}
</style>
