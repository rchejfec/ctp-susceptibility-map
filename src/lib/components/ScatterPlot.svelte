<script>
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';
	import {
		filteredMetrics,
		currentMetricConfig,
		highlightRegions,
		clearHighlights,
		toggleRegionSelection,
		highlightedRegions,
		selectedRegion
	} from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * Scatter Plot Component
	 *
	 * Shows relationship between two variables
	 * Supports linked highlighting with map
	 */

	const chartConfig = mapConfig.charts?.scatterChart || {};
	const height = chartConfig.height || 300;
	const margin = { top: 20, right: 40, bottom: 60, left: 80 }; // Increased margins to prevent label overlap

	let container;
	let svg;
	let tooltip;

	$: if (container && $filteredMetrics && $currentMetricConfig) {
		renderChart($filteredMetrics, $currentMetricConfig);
	}

	$: if (svg) {
		updateHighlight($highlightedRegions, $selectedRegion);
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

		// Filter data with valid values
		const xColumn = chartConfig.xColumn;
		// Use metric-specific scatterYColumn if available (for dynamic Y-axis)
		const yColumn = metricConfig.scatterYColumn || chartConfig.yColumn;
		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';
		const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';

		const plotData = data.filter(
			(d) => d[xColumn] != null && d[yColumn] != null && !isNaN(d[xColumn]) && !isNaN(d[yColumn])
		);

		if (plotData.length === 0) {
			svg
				.append('text')
				.attr('x', innerWidth / 2)
				.attr('y', innerHeight / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', '#999')
				.text('No data available');
			return;
		}

		// Scales
		const xScale =
			chartConfig.xScale === 'log'
				? d3
						.scaleLog()
						.domain([
							d3.min(plotData, (d) => d[xColumn]) || 1,
							d3.max(plotData, (d) => d[xColumn]) || 10
						])
						.range([0, innerWidth])
						.nice()
				: d3
						.scaleLinear()
						.domain([0, d3.max(plotData, (d) => d[xColumn])])
						.range([0, innerWidth])
						.nice();

		const yScale =
			chartConfig.yScale === 'log'
				? d3
						.scaleLog()
						.domain([
							d3.min(plotData, (d) => d[yColumn]) || 1,
							d3.max(plotData, (d) => d[yColumn]) || 10
						])
						.range([innerHeight, 0])
						.nice()
				: d3
						.scaleLinear()
						.domain([0, d3.max(plotData, (d) => d[yColumn])])
						.range([innerHeight, 0])
						.nice();

		// Axes
		const xAxis = d3
			.axisBottom(xScale)
			.tickFormat(
				typeof chartConfig.xFormat === 'function' ? chartConfig.xFormat : d3.format(chartConfig.xFormat || '~s')
			);

		const yAxis = d3
			.axisLeft(yScale)
			.tickFormat(
				typeof chartConfig.yFormat === 'function' ? chartConfig.yFormat : d3.format(chartConfig.yFormat || '~s')
			);

		svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

		svg.append('g').attr('class', 'y-axis').call(yAxis);

		// Axis labels
		if (chartConfig.xLabel) {
			svg
				.append('text')
				.attr('class', 'axis-label')
				.attr('x', innerWidth / 2)
				.attr('y', innerHeight + 40)
				.attr('text-anchor', 'middle')
				.attr('fill', '#666')
				.attr('font-size', '12px')
				.text(chartConfig.xLabel);
		}

		if (chartConfig.yLabel) {
			svg
				.append('text')
				.attr('class', 'axis-label')
				.attr('transform', 'rotate(-90)')
				.attr('x', -innerHeight / 2)
				.attr('y', -45)
				.attr('text-anchor', 'middle')
				.attr('fill', '#666')
				.attr('font-size', '12px')
				.text(chartConfig.yLabel);
		}

		// Create tooltip
		tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'scatter-tooltip')
			.style('position', 'absolute')
			.style('visibility', 'hidden')
			.style('background', 'rgba(0, 0, 0, 0.8)')
			.style('color', 'white')
			.style('padding', '8px 12px')
			.style('border-radius', '4px')
			.style('font-size', '12px')
			.style('pointer-events', 'none')
			.style('z-index', '10000');

		// Points
		svg
			.selectAll('.point')
			.data(plotData)
			.enter()
			.append('circle')
			.attr('class', 'point')
			.attr('data-id', (d) => d[idField])
			.attr('cx', (d) => xScale(d[xColumn]))
			.attr('cy', (d) => yScale(d[yColumn]))
			.attr('r', chartConfig.pointRadius || 4)
			.attr('fill', chartConfig.pointColor || '#4A90E2')
			.attr('opacity', 0.7)
			.on('mouseover', function (event, d) {
				if (chartConfig.linkedHighlight) {
					highlightRegions([d[idField]]);
				}

				if (chartConfig.showTooltip && tooltip) {
					const xFormatter =
						typeof chartConfig.xFormat === 'function'
							? chartConfig.xFormat
							: d3.format(chartConfig.xFormat || '~s');
					const yFormatter =
						typeof chartConfig.yFormat === 'function'
							? chartConfig.yFormat
							: d3.format(chartConfig.yFormat || '~s');

					tooltip
						.style('visibility', 'visible')
						.html(
							`<strong>${d[nameField]}</strong><br/>` +
								`${chartConfig.xLabel || xColumn}: ${xFormatter(d[xColumn])}<br/>` +
								`${chartConfig.yLabel || yColumn}: ${yFormatter(d[yColumn])}`
						);
				}

				d3.select(this)
					.attr('r', chartConfig.highlightRadius || 6)
					.attr('fill', chartConfig.highlightColor || '#FFD700')
					.attr('opacity', 1);
			})
			.on('mousemove', function (event) {
				if (tooltip) {
					tooltip.style('top', event.pageY + 10 + 'px').style('left', event.pageX + 10 + 'px');
				}
			})
			.on('mouseout', function () {
				clearHighlights();

				if (tooltip) {
					tooltip.style('visibility', 'hidden');
				}

				d3.select(this)
					.attr('r', chartConfig.pointRadius || 4)
					.attr('fill', chartConfig.pointColor || '#4A90E2')
					.attr('opacity', 0.7);
			})
			.on('click', function (event, d) {
				toggleRegionSelection(d[idField]);
			});
	}

	function updateHighlight(highlightedIds, selectedId) {
		if (!svg) return;

		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';

		// Reset all points
		svg
			.selectAll('.point')
			.attr('r', chartConfig.pointRadius || 4)
			.attr('fill', chartConfig.pointColor || '#4A90E2')
			.attr('opacity', 0.7);

		// Highlight specific points
		if (highlightedIds && highlightedIds.length > 0) {
			svg.selectAll('.point').each(function (d) {
				if (highlightedIds.includes(d[idField])) {
					d3.select(this)
						.attr('r', chartConfig.highlightRadius || 6)
						.attr('fill', chartConfig.highlightColor || '#FFD700')
						.attr('opacity', 1);
				}
			});
		}

		// Selected point (distinct from highlight)
		if (selectedId) {
			svg.selectAll('.point').each(function (d) {
				if (String(d[idField]) === String(selectedId)) {
					d3.select(this)
						.attr('r', chartConfig.highlightRadius || 6)
						.attr('fill', '#FF6B6B')
						.attr('opacity', 1)
						.raise();
				}
			});
		}
	}

	onMount(() => {
		if ($filteredMetrics && $currentMetricConfig) {
			renderChart($filteredMetrics, $currentMetricConfig);
		}

		return () => {
			// Cleanup tooltip on unmount
			if (tooltip) {
				tooltip.remove();
			}
		};
	});
</script>

<div class="scatter-plot-container">
	<h3 class="chart-title">{chartConfig.title || 'Scatter Plot'}</h3>
	<div bind:this={container} class="chart"></div>
</div>

<style>
	.scatter-plot-container {
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

	:global(.point) {
		cursor: pointer;
		transition: all 0.2s;
		stroke: white;
		stroke-width: 1px;
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
