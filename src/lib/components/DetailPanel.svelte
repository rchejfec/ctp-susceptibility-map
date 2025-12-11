<script>
	import {
		selectedRegionData,
		selectedRegion,
		selectedRegionSupplementary,
		selectedProvince
	} from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * Detail Panel Component
	 *
	 * Displays detailed information about the selected region
	 * Supports multiple panel sections from config
	 */

	// Only show the first panel (basic info card for sidebar)
	// DetailPanel2 handles the second panel (NAICS table in Row 2)
	const panels = mapConfig.detailPanels ? [mapConfig.detailPanels[0]] : [];
	const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';

	function clearSelection() {
		selectedRegion.set(null);
		// No longer resets province filter - preserves existing filters
	}

	/**
	 * Render a fields-type panel
	 */
	function renderFieldsPanel(panel, data) {
		if (!data || !panel.fields) return [];

		return panel.fields.map((field) => {
			const value = data[field.key];
			const formatted = panel.format ? panel.format(value, field) : formatValue(value, field);
			return {
				label: field.label,
				value: formatted
			};
		});
	}

	/**
	 * Default format function
	 */
	function formatValue(value, field) {
		if (value == null || value === '') return 'N/A';

		const prefix = field.prefix || '';
		const suffix = field.suffix || '';

		if (typeof value === 'number') {
			return `${prefix}${value.toLocaleString()}${suffix}`;
		}

		return `${prefix}${value}${suffix}`;
	}
</script>

<div class="detail-panel">
	<div class="panel-header">
		<h3>Region Details</h3>
		{#if $selectedRegionData}
			<button class="clear-btn" on:click={clearSelection} title="Clear selection">×</button>
		{/if}
	</div>

	<div class="panel-content">
		{#if $selectedRegionData}
			<!-- Region name header -->
			<div class="region-name">{$selectedRegionData[nameField]}</div>

			<!-- Iterate through configured panels -->
			{#each panels as panel}
				<div class="panel-section">
					{#if panel.title}
						<h4 class="section-title">{panel.title}</h4>
					{/if}

					{#if panel.type === 'fields'}
						<!-- Fields-type panel: simple key-value display -->
						<div class="fields">
							{#each renderFieldsPanel(panel, $selectedRegionData) as field}
								<div class="field-row">
									<span class="field-label">{field.label}:</span>
									<span class="field-value">{field.value}</span>
								</div>
							{/each}
						</div>
					{:else if panel.type === 'custom'}
						<!-- Custom panel: for supplementary data -->
						{#if $selectedRegionSupplementary && $selectedRegionSupplementary.length > 0}
							<div class="custom-content">
								{#if panel.template === 'list'}
									<ul class="supplementary-list">
										{#each $selectedRegionSupplementary as item}
											<li>
												{#if item.rank}
													<span class="rank">{item.rank}.</span>
												{/if}
												<span class="item-name">{item.industry || item.name || item.label}</span>
												{#if item.value}
													<span class="item-value">{formatValue(item.value, {})}</span>
												{/if}
											</li>
										{/each}
									</ul>
								{:else if panel.template === 'table'}
									<table class="supplementary-table">
										<tbody>
											{#each $selectedRegionSupplementary as item}
												<tr>
													{#if item.rank}
														<td class="rank-col">{item.rank}</td>
													{/if}
													<td class="name-col">{item.industry || item.name || item.label}</td>
													{#if item.value}
														<td class="value-col">{formatValue(item.value, {})}</td>
													{/if}
												</tr>
											{/each}
										</tbody>
									</table>
								{/if}
							</div>
						{:else}
							<p class="no-data">No supplementary data available</p>
						{/if}
					{/if}
				</div>
			{/each}
		{:else}
			<p class="placeholder">Click a region to view details</p>
		{/if}
	</div>
</div>

<style>
	.detail-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		/* No background - parent provides it */
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 0.75rem 0; /* Match other card headers */
		border-bottom: 1px solid #eee; /* Match other card headers */
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}

	h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #333;
	}

	.clear-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.clear-btn:hover {
		background-color: #f0f0f0;
		color: #333;
	}

	.panel-content {
		flex: 1;
		padding: 0; /* No padding - matches chart containers */
		overflow-y: auto;
		font-size: 0.875rem;
	}

	.region-name {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		color: #333;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.panel-section {
		margin-bottom: 1.5rem;
	}

	.panel-section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		font-size: 0.85rem;
		font-weight: 600;
		color: #555;
		margin: 0 0 0.75rem 0;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		background-color: #f9f9f9;
		border-radius: 4px;
		gap: 1rem;
	}

	.field-label {
		color: #666;
		font-weight: 500;
		font-size: 0.8rem;
	}

	.field-value {
		color: #333;
		font-weight: 400;
		text-align: right;
		font-size: 0.8rem;
	}

	.custom-content {
		font-size: 0.8rem;
	}

	.supplementary-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.supplementary-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: #f9f9f9;
		border-radius: 4px;
		margin-bottom: 0.4rem;
	}

	.supplementary-list li:last-child {
		margin-bottom: 0;
	}

	.rank {
		font-weight: 600;
		color: #4a90e2;
		min-width: 1.5rem;
	}

	.item-name {
		flex: 1;
		color: #333;
	}

	.item-value {
		color: #666;
		font-weight: 500;
	}

	.supplementary-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}

	.supplementary-table td {
		padding: 0.5rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.supplementary-table tr:last-child td {
		border-bottom: none;
	}

	.rank-col {
		width: 2rem;
		font-weight: 600;
		color: #4a90e2;
	}

	.name-col {
		color: #333;
	}

	.value-col {
		text-align: right;
		color: #666;
		font-weight: 500;
	}

	.placeholder,
	.no-data {
		color: #999;
		font-style: italic;
		margin: 0;
		text-align: center;
		padding: 2rem 1rem;
		font-size: 0.875rem;
	}
</style>
