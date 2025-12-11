<script>
	import { selectedMetric, switchMetric } from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * Metric Switcher Component
	 *
	 * Allows users to switch between different metrics
	 * Style: 'dropdown' or 'tabs'
	 */

	const style = mapConfig.features?.metricSwitcher?.style || 'dropdown';
	const metrics = mapConfig.metrics || [];

	function handleChange(event) {
		switchMetric(event.target.value);
	}

	function handleTabClick(metricId) {
		switchMetric(metricId);
	}
</script>

{#if style === 'dropdown'}
	<div class="metric-switcher-dropdown">
		<label for="metric-select">Metric:</label>
		<select id="metric-select" value={$selectedMetric} on:change={handleChange}>
			{#each metrics as metric}
				<option value={metric.id}>
					{metric.label}
				</option>
			{/each}
		</select>
	</div>
{:else if style === 'tabs'}
	<div class="metric-switcher-tabs">
		{#each metrics as metric}
			<button
				class="tab"
				class:active={$selectedMetric === metric.id}
				on:click={() => handleTabClick(metric.id)}
				title={metric.description || metric.label}
			>
				{metric.label}
			</button>
		{/each}
	</div>
{/if}

<style>
	/* Dropdown style */
	.metric-switcher-dropdown {
		/* Removed background and box-shadow, parent sidebar-section handles card style */
		display: flex;
		flex-direction: column; /* Stack label and select */
		gap: 0.25rem; /* Gap between label and select */
		width: 100%;
	}

	label {
		display: block; /* Standardize label display */
		font-size: 0.75rem;
		font-weight: 500;
		color: #333;
		margin: 0;
	}

	select {
		width: 100%;
		padding: 0.4rem 0.75rem; /* Standardized padding */
		border: 1px solid #ddd;
		border-radius: 4px; /* Standardized border-radius */
		font-size: 0.8125rem; /* Standardized font size (13px) */
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	select:hover {
		border-color: #999;
	}

	select:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
	}

	/* Tabs style */
	.metric-switcher-tabs {
		display: flex;
		gap: 0.5rem;
		background: white;
		padding: 0.5rem;
		border-radius: 6px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.tab {
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.tab:hover {
		background: #f0f0f0;
		color: #333;
	}

	.tab.active {
		background: #4a90e2;
		color: white;
	}

	.tab:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
	}
</style>
