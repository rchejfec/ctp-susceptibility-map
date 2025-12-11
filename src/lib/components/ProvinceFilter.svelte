<script>
	import { selectedProvince, metricsData } from '$lib/stores/mapStore.js';
	import { mapConfig, regionGroups } from '$lib/mapConfig.js';

	/**
	 * Province Filter Component
	 *
	 * Dropdown filter for provinces/territories + region groups
	 */

	const config = mapConfig.features?.provinceFilter || {};
	const label = config.label || 'Province/Territory';
	const allLabel = config.allLabel || 'All Provinces';
	const showRegionGroups = mapConfig.regionGroups?.enabled ?? false;

	let provinces = [];

	$: if ($metricsData) {
		// Get unique provinces sorted by name
		provinces = [
			...new Set($metricsData.map((d) => d.Province_Name).filter((p) => p != null && p !== 'Unknown'))
		].sort();
	}

	function handleChange(event) {
		const value = event.target.value;
		selectedProvince.set(value || null);
	}
</script>

<div class="filter">
	<label for="province-filter">{label}</label>
	<select id="province-filter" on:change={handleChange} value={$selectedProvince || ''}>
		<option value="">{allLabel}</option>

		{#if showRegionGroups}
			<optgroup label="Region Groups">
				{#each Object.values(regionGroups) as group}
					<option value={group.id}>{group.label}</option>
				{/each}
			</optgroup>
			<optgroup label="Provinces">
				{#each provinces as province}
					<option value={province}>{province}</option>
				{/each}
			</optgroup>
		{:else}
			{#each provinces as province}
				<option value={province}>{province}</option>
			{/each}
		{/if}
	</select>
</div>

<style>
	.filter {
		margin-top: 0.5rem; /* Keep some spacing if needed, or remove */
		width: 100%;
	}

	label {
		display: block;
		font-size: 0.75rem; /* Standardized font size */
		color: #333; /* Standardized color */
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	select {
		width: 100%;
		font-size: 0.8125rem; /* Standardized font size (13px) */
		padding: 0.4rem 0.75rem; /* Standardized padding */
		border: 1px solid #ddd; /* Standardized border */
		border-radius: 4px; /* Standardized border-radius */
		background-color: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	select:hover {
		border-color: #999;
	}

	select:focus {
		outline: none;
		border-color: #4a90e2; /* Standardized focus color */
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1); /* Standardized focus shadow */
	}
</style>
