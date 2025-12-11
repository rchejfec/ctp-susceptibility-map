<script>
	/**
	 * Second Detail Panel Component - NAICS Sector Details Table
	 *
	 * Displays sector/NAICS information for selected region, filtered by current metric
	 */
	import {
		selectedRegionData,
		selectedRegion,
		selectedRegionSupplementary,
		selectedMetric
	} from '$lib/stores/mapStore.js';
	import { getContext } from 'svelte';

	// Get config from context
	const configStore = getContext('mapConfig');

	$: panel = $configStore?.detailPanels?.[1] || $configStore?.detailPanels?.[0];
	$: nameField = $configStore?.fields?.geometry?.nameField || 'CD_Name';

	// NAICS code to sector name lookup
	const NAICS_LOOKUP = {
		'311': 'Food manufacturing',
		'322': 'Paper manufacturing',
		'324': 'Petroleum & coal products',
		'325': 'Chemical manufacturing',
		'327': 'Non-metallic mineral products',
		'331': 'Primary metal manufacturing',
		'336': 'Transportation equipment',
		'481': 'Air transportation',
		'483': 'Water transportation',
		'484': 'Truck transportation',
		'486': 'Pipeline transportation',
		'493': 'Warehousing & storage',
		'1125': 'Aquaculture',
		'2111': 'Oil & gas extraction',
		'2121': 'Coal mining',
		'2122': 'Metal ore mining',
		'2123': 'Non-metallic mineral mining',
		'2131': 'Support activities for mining',
		'2211': 'Electric power generation',
		'2212': 'Natural gas distribution',
		'3221': 'Pulp, paper & paperboard mills',
		'3241': 'Petroleum & coal products',
		'3313': 'Alumina & aluminum production',
		'3314': 'Non-ferrous metal production',
		'3315': 'Foundries',
		// Additional codes from data
		'113': 'Forestry',
		'1114': 'Greenhouse/nursery',
		'321': 'Wood products',
		'3211': 'Sawmills',
		'3212': 'Plywood',
		'3219': 'Other wood',
		'326': 'Plastics & rubber',
		'3261': 'Plastics',
		'3262': 'Rubber',
		'332': 'Fabricated metal',
		'3321': 'Forging/stamping',
		'333': 'Machinery',
		'3344': 'HVAC',
		'3361': 'Motor vehicles',
		'3363': 'Motor vehicle parts',
		'3364': 'Aerospace',
		'3399': 'Other manufacturing',
		'485': 'Transit',
		'4861': 'Pipeline (oil)',
		'4862': 'Pipeline (gas)',
		'562': 'Waste management',
		'5622': 'Waste treatment',
		'5629': 'Remediation',
		'6113': 'Universities',
		'6221': 'Hospitals',
		'9111': 'Defence',
		'9119': 'Other public admin'
	};

	/**
	 * Get sector name for NAICS code
	 */
	function getSectorName(naicsCode) {
		if (!naicsCode) return '';
		return NAICS_LOOKUP[naicsCode] || `NAICS ${naicsCode}`;
	}

	/**
	 * Map metric ID to data Metric code
	 */
	function getMetricCode(metricId) {
		const mapping = {
			import_susceptibility: 'IS',
			manufacturing_susceptibility: 'MS',
			fossil_fuel_susceptibility: 'FS',
			top_score: null // Don't show for Top Score
		};
		return mapping[metricId];
	}

	// Filter supplementary data by current metric
	$: metricCode = getMetricCode($selectedMetric);
	$: metricFilteredSupp =
		metricCode && $selectedRegionSupplementary
			? $selectedRegionSupplementary.filter((row) => row.Metric === metricCode)
			: [];
	$: displayData = metricFilteredSupp.slice(0, 10); // Top 10 sectors
</script>

<div class="detail-panel">
	<div class="panel-header">
		<h3>{panel?.title || 'Sector Details'}</h3>
	</div>

	<div class="panel-content">
		{#if !$selectedRegionData}
			<p class="placeholder">Select a census division to view sector details</p>
		{:else if !metricCode}
			<p class="no-data">Sector details not available for Top Score metric</p>
		{:else if !metricFilteredSupp || metricFilteredSupp.length === 0}
			<p class="no-data">No sector data available for this metric</p>
		{:else}
			<div class="region-name">{$selectedRegionData[nameField]}</div>

			<table class="supplementary-table">
				<thead>
					<tr>
						<th class="rank-col">Rank</th>
						<th class="naics-col">NAICS</th>
						<th class="name-col">Sector</th>
						<th class="share-col">Share</th>
					</tr>
				</thead>
				<tbody>
					{#each displayData as item}
						<tr>
							<td class="rank-col">{item.Rank}</td>
							<td class="naics-col">{item.NAICS || 'N/A'}</td>
							<td class="name-col">{getSectorName(item.NAICS)}</td>
							<td class="share-col">{item.Share}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.detail-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 0.75rem 0;
		border-bottom: 1px solid #eee;
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}

	h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #333;
	}

	.panel-content {
		flex: 1;
		padding: 0;
		overflow-y: auto;
		font-size: 0.875rem;
	}

	.region-name {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #333;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.supplementary-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.supplementary-table thead {
		background-color: #f5f5f5;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.supplementary-table th {
		padding: 0.5rem;
		text-align: left;
		font-weight: 600;
		color: #555;
		border-bottom: 2px solid #ddd;
	}

	.supplementary-table td {
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.supplementary-table tbody tr:hover {
		background-color: #f9f9f9;
	}

	.rank-col {
		width: 50px;
		text-align: center;
	}

	.naics-col {
		width: 70px;
		font-family: monospace;
	}

	.name-col {
		flex: 1;
	}

	.share-col {
		width: 70px;
		text-align: right;
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

	.no-data {
		color: #666;
	}
</style>
