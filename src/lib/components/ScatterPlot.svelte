<script>
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
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
	 * Scatter Plot Component (Apache ECharts version)
	 *
	 * Shows relationship between two variables
	 * Supports linked highlighting with map
	 */

	const chartConfig = mapConfig.charts?.scatterChart || {};
	const height = chartConfig.height || 300;

	let chartDiv;
	let myChart;
	let resizeObserver;

	// Reactive statements
	$: if (myChart && $filteredMetrics && $currentMetricConfig) {
		updateChart($filteredMetrics, $currentMetricConfig);
	}

	$: if (myChart && $highlightedRegions) {
		handleExternalHighlight($highlightedRegions);
	}

	$: if (myChart && $selectedRegion) {
		// Just treat selection as a highlight for now, or we could add a markPoint
		handleExternalHighlight([$selectedRegion]);
	}

	function updateChart(data, metricConfig) {
		const xColumn = chartConfig.xColumn;
		const yColumn = metricConfig.scatterYColumn || chartConfig.yColumn;
		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';
		const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';

		const plotData = data
			.filter(
				(d) => d[xColumn] != null && d[yColumn] != null && !isNaN(d[xColumn]) && !isNaN(d[yColumn])
			)
			.map((d) => {
				return {
					value: [d[xColumn], d[yColumn]],
					name: d[nameField],
					id: d[idField]
				};
			});

		const option = {
			tooltip: {
				trigger: 'item',
				formatter: (params) => {
					const d = params.data;
					return `<strong>${d.name}</strong><br/>
                            ${chartConfig.xLabel}: ${params.value[0]}<br/>
                            ${chartConfig.yLabel}: ${params.value[1]}`;
				}
			},
			grid: {
				left: '8%',
				right: '8%',
				bottom: '10%',
				top: '5%'
			},
			xAxis: {
				type: chartConfig.xScale === 'log' ? 'log' : 'value',
				name: chartConfig.xLabel,
				nameLocation: 'middle',
				nameGap: 30,
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: chartConfig.yScale === 'log' ? 'log' : 'value',
				name: chartConfig.yLabel,
				nameLocation: 'middle',
				nameGap: 40,
				splitLine: {
					show: true,
					lineStyle: {
						type: 'dashed'
					}
				}
			},
			series: [
				{
					type: 'scatter',
					data: plotData,
					symbolSize: chartConfig.pointRadius || 6,
					itemStyle: {
						color: chartConfig.pointColor || '#4A90E2',
						opacity: 0.7
					},
					emphasis: {
						focus: 'self',
						itemStyle: {
							color: chartConfig.highlightColor || '#FFD700',
							borderColor: '#fff',
							borderWidth: 2,
							opacity: 1,
							shadowBlur: 10,
							shadowColor: 'rgba(0,0,0,0.3)'
						},
						scale: true
					}
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

		// ECharts dispatchAction 'highlight' works by dataIndex or name.
		// We have IDs in the data. We need to find the data indices.
		// This might be slow for large datasets if we search every time.
		// Optimization: Store a map of id -> dataIndex?

		const option = myChart.getOption();
		// option.series[0].data contains the data
		// But getOption might return the merged option, checking if 'data' is available
		// It's safer to use the data we passed in updateChart, but that's local scope.
		// Let's rely on internal model if possible, or just search.
		// Accessing series data from model:
		const seriesData = option.series[0].data;

		const indices = [];
		seriesData.forEach((d, index) => {
			if (highlightedIds.includes(String(d.id))) {
				indices.push(index);
			}
		});

		if (indices.length > 0) {
			myChart.dispatchAction({
				type: 'highlight',
				seriesIndex: 0,
				dataIndex: indices
			});
		} else {
             myChart.dispatchAction({
				type: 'downplay',
				seriesIndex: 0
			});
        }
	}

	onMount(() => {
		myChart = echarts.init(chartDiv);

		resizeObserver = new ResizeObserver(() => {
			myChart.resize();
		});
		resizeObserver.observe(chartDiv);

		// Interactions
		myChart.on('mouseover', (params) => {
			if (chartConfig.linkedHighlight && params.data.id) {
				highlightRegions([params.data.id]);
			}
		});

		myChart.on('mouseout', () => {
			clearHighlights();
		});

		myChart.on('click', (params) => {
			if (params.data.id) {
				toggleRegionSelection(params.data.id);
			}
		});

		if ($filteredMetrics && $currentMetricConfig) {
			updateChart($filteredMetrics, $currentMetricConfig);
		}
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (myChart) myChart.dispose();
	});
</script>

<div class="scatter-plot-container">
	<h3 class="chart-title">{chartConfig.title || 'Scatter Plot'}</h3>
	<div bind:this={chartDiv} class="chart"></div>
</div>

<style>
	.scatter-plot-container {
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
		height: 300px; /* Default */
		flex: 1;
	}
</style>
