<script>
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
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
	 * Bar Chart Component (Apache ECharts version)
	 *
	 * Horizontal or vertical bar chart with aggregated data
	 * Supports linked highlighting with map
	 */

	const chartConfig = mapConfig.charts?.barChart || {};
	const height = chartConfig.height || 300;

	let chartDiv;
	let myChart;
	let resizeObserver;

	// Aggregated data storage for interaction mapping
	let currentAggregatedData = [];

	// Reactive statements
	$: if (myChart && $filteredMetrics && $currentMetricConfig) {
		updateChart($filteredMetrics, $currentMetricConfig);
	}

	$: if (myChart && $highlightedRegions) {
		handleExternalHighlight($highlightedRegions);
	}

	$: if (myChart && $selectedRegion) {
		handleExternalSelection($selectedRegion);
	} else if (myChart && !$selectedRegion) {
		// Clear selection effect if needed
		myChart.dispatchAction({
			type: 'downplay',
			seriesIndex: 'all',
			dataIndex: 'all'
		});
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

		// Group by province
		const provinceGroups = {};
		data.forEach((d) => {
			const key = d[groupBy];
			if (!provinceGroups[key]) provinceGroups[key] = [];
			provinceGroups[key].push(d);
		});

		const aggregated = [];

		Object.entries(provinceGroups).forEach(([provinceName, provinceData]) => {
			// Total labour force in this province
			const totalLabourForce = provinceData.reduce((sum, d) => {
				const val = d[aggColumn];
				return sum + (val != null && !isNaN(val) ? val : 0);
			}, 0);

			const categoryData = {};
			let totalShare = 0;

			// For each category (3, 4, 5), calculate share
			[3, 4, 5].forEach((category) => {
				// Filter CDs with this exact score
				const categoryRows = provinceData.filter((d) => d[scoreField] === category);

				// Sum labour force for this category
				const categoryLabourForce = categoryRows.reduce((sum, d) => {
					const val = d[aggColumn];
					return sum + (val != null && !isNaN(val) ? val : 0);
				}, 0);

				// Calculate share: category labour force / total PT labour force
				const share = totalLabourForce > 0 ? categoryLabourForce / totalLabourForce : 0;

				categoryData[category] = {
					value: share,
					items: categoryRows
				};

				totalShare += share;
			});

			aggregated.push({
				group: provinceName,
				totalValue: totalShare, // For sorting
				categories: categoryData,
				allItemIds: provinceData.map((d) => d[mapConfig.fields.metrics.idField])
			});
		});

		// Sort
		if (chartConfig.sort === 'descending') {
			aggregated.sort((a, b) => b.totalValue - a.totalValue);
		} else if (chartConfig.sort === 'ascending') {
			aggregated.sort((a, b) => a.totalValue - b.totalValue);
		}

		return aggregated;
	}

	function aggregateDataSimple(data, config) {
		const groupBy = chartConfig.groupBy;
		const aggColumn = config.column;
		const aggFunction = chartConfig.aggregateFunction || 'sum';

		const groups = {};
		data.forEach((d) => {
			const key = d[groupBy];
			if (!groups[key]) groups[key] = [];
			groups[key].push(d);
		});

		const aggregated = [];
		Object.entries(groups).forEach(([key, values]) => {
			let aggValue;
			const numericValues = values
				.map((d) => d[aggColumn])
				.filter((v) => v != null && !isNaN(v));

			if (aggFunction === 'sum') {
				aggValue = numericValues.reduce((a, b) => a + b, 0);
			} else if (aggFunction === 'mean') {
				aggValue = numericValues.length
					? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
					: 0;
			} else if (aggFunction === 'median') {
				// simple median implementation
				const sorted = numericValues.sort((a, b) => a - b);
				const mid = Math.floor(sorted.length / 2);
				aggValue =
					sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
			} else if (aggFunction === 'count') {
				aggValue = values.length;
			}

			aggregated.push({
				group: key,
				value: aggValue,
				items: values,
				allItemIds: values.map((d) => d[mapConfig.fields.metrics.idField])
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

	function updateChart(data, metricConfig) {
		const isStacked =
			chartConfig.stacked && chartConfig.aggregateFunction === 'share_by_category';

		let aggregated;
		if (isStacked) {
			aggregated = aggregateDataStacked(data, metricConfig);
		} else {
			aggregated = aggregateDataSimple(data, metricConfig);
		}

		currentAggregatedData = aggregated;

		const yCategories = aggregated.map((d) => d.group);

		let series = [];

		if (isStacked) {
			// Create a series for each category (3, 4, 5)
			[3, 4, 5].forEach((cat) => {
				const seriesData = aggregated.map((d) => {
					const catData = d.categories[cat];
					return {
						value: catData.value,
						// Store item IDs for this specific segment for highlighting
						itemIds: catData.items.map((item) => item[mapConfig.fields.metrics.idField])
					};
				});

				series.push({
					name: `Category ${cat}`, // Could use config labels
					type: 'bar',
					stack: 'total',
					data: seriesData,
					itemStyle: {
						color: chartConfig.colors[cat] || '#999'
					},
					emphasis: {
						focus: 'series',
						itemStyle: {
							opacity: 0.8
						}
					}
				});
			});
		} else {
			// Simple Bar
			const seriesData = aggregated.map((d) => ({
				value: d.value,
				itemIds: d.allItemIds
			}));

			series.push({
				type: 'bar',
				data: seriesData,
				itemStyle: {
					color: chartConfig.barColor || '#4A90E2'
				},
				emphasis: {
					itemStyle: {
						color: chartConfig.highlightColor || '#FFD700'
					}
				}
			});
		}

		const option = {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: (params) => {
					let html = `<strong>${params[0].axisValue}</strong><br/>`;
					params.forEach((p) => {
						if (p.value > 0) {
							const val = p.value * 100; // Assuming percentage for stacked
							html += `${p.marker} ${p.seriesName}: ${val.toFixed(1)}%<br/>`;
						}
					});
					return html;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'value',
				axisLabel: {
					formatter: (value) => {
						if (chartConfig.xFormat === '.1%') return (value * 100).toFixed(0) + '%';
						return value;
					}
				}
			},
			yAxis: {
				type: 'category',
				data: yCategories
			},
			series: series
		};

		myChart.setOption(option);
	}

	function handleExternalHighlight(highlightedIds) {
		// Highlight bars that contain the highlighted regions
		// In ECharts, we can use 'highlight' action, but that usually highlights a whole data item.
		// If multiple bars contain the region (unlikely if grouped by province), we highlight them.

		if (!highlightedIds || highlightedIds.length === 0) {
			myChart.dispatchAction({
				type: 'downplay',
				seriesIndex: 'all',
				dataIndex: 'all'
			});
			return;
		}

		// Find indices of data items that contain any of the highlighted IDs
		// Since we have multiple series (if stacked), we need to check all series data.

		// Note: This approach highlights the whole bar stack for the province if any region matches.
		// Or we could try to highlight specific segments if possible.

		// MapLibre highlight is usually one or more regions.
		// We want to highlight the Province Bar that contains these regions.

		const indicesToHighlight = new Set();

		// We iterate over our local aggregated data to find matches
		currentAggregatedData.forEach((d, index) => {
			const hasMatch = d.allItemIds.some(id => highlightedIds.includes(String(id)));
			if (hasMatch) {
				indicesToHighlight.add(index);
			}
		});

		// Dispatch highlight action
		// We need to know how many series we have
		const option = myChart.getOption();
		const seriesCount = option.series.length;

		for (let sIndex = 0; sIndex < seriesCount; sIndex++) {
			indicesToHighlight.forEach(dataIndex => {
				myChart.dispatchAction({
					type: 'highlight',
					seriesIndex: sIndex,
					dataIndex: dataIndex
				});
			});
		}
	}

	function handleExternalSelection(regionId) {
		// Similar to highlight but for selection (maybe different visual?)
		// The original D3 code turned the selected province bar RED.
		// We can do this by updating the itemStyle of the specific data item?
		// Or just use emphasis?

		// For now, let's just ensure it's highlighted/focused.
		// Since selection implies a persistent state, maybe we should actually update the data config color?
		// But that's expensive.

		// Let's rely on the highlight logic for now, as ECharts 'select' state is also an option.
		if (regionId) handleExternalHighlight([regionId]);
	}

	onMount(() => {
		myChart = echarts.init(chartDiv);

		// Handle Resize
		resizeObserver = new ResizeObserver(() => {
			myChart.resize();
		});
		resizeObserver.observe(chartDiv);

		// Event Listeners
		myChart.on('mouseover', (params) => {
			if (!chartConfig.linkedHighlight) return;
			// Params contains data which has itemIds
			// params.data is the raw data object we passed in series
			const ids = params.data.itemIds;
			if (ids) {
				highlightRegions(ids);
			}
		});

		myChart.on('mouseout', () => {
			clearHighlights();
		});

		// Initial Render
		if ($filteredMetrics && $currentMetricConfig) {
			updateChart($filteredMetrics, $currentMetricConfig);
		}
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (myChart) myChart.dispose();
	});
</script>

<div class="bar-chart-container">
	<h3 class="chart-title">{$currentMetricConfig?.label || 'Metric'} {chartConfig.title || ''}</h3>
	<div bind:this={chartDiv} class="chart"></div>
</div>

<style>
	.bar-chart-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #333;
		flex-shrink: 0;
	}

	.chart {
		width: 100%;
		height: 300px; /* Default height */
		flex: 1;
	}
</style>
