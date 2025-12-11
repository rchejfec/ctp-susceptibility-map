<script>
	import { currentMetricConfig } from '$lib/stores/mapStore.js';

	/**
	 * Legend Component
	 *
	 * Dynamically generates legend based on current metric config
	 * Supports both continuous and categorical metrics
	 */

	$: legendItems = getLegendItems($currentMetricConfig);
	$: legendTitle = $currentMetricConfig?.label || 'Legend';

	function getLegendItems(metricConfig) {
		if (!metricConfig) return [];

		if (metricConfig.type === 'continuous') {
			// Continuous scale
			const labels = metricConfig.scale?.legendLabels;
			const colors = metricConfig.scale?.colors;

			if (!labels || !colors) return [];

			// Reverse to show high values first
			return [...labels]
				.reverse()
				.map((item, i) => {
					const colorIndex = colors.length - 1 - i;
					const color = colors[colorIndex] ? colors[colorIndex][1] : colors[colors.length - 1][1];
					return { label: item.label, color };
				});
		} else if (metricConfig.type === 'categorical') {
			// Categorical scale - show high to low
			const categories = metricConfig.scale?.categories;
			const colors = metricConfig.scale?.colors;
			const labels = metricConfig.scale?.labels;

			if (!categories || !colors) return [];

			// Reverse to show high values (5) first
			return [...categories]
				.reverse()
				.map((category) => ({
					label: labels?.[category] || String(category),
					color: colors[category]
				}));
		}

		return [];
	}
</script>

<div class="legend">
	<h3>{legendTitle}</h3>
	<div class="legend-items">
		{#each legendItems as item}
			<div class="legend-item">
				<div class="legend-color" style="background-color: {item.color}"></div>
				<span>{item.label}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.legend {
		padding: 0;
	}

	h3 {
		font-size: 0.75rem;
		color: #666;
		margin: 0 0 0.5rem 0;
		font-weight: 500;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.legend-item span {
		font-size: 0.7rem;
		color: #333;
	}
</style>
