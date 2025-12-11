<script>
	import { searchQuery, searchResults, selectRegion } from '$lib/stores/mapStore.js';
	import { mapConfig } from '$lib/mapConfig.js';

	/**
	 * Search Bar Component
	 *
	 * Allows users to search for regions by name
	 */

	const config = mapConfig.features?.searchBar || {};
	const placeholder = config.placeholder || 'Search regions...';
	const nameField = mapConfig.fields?.geometry?.nameField || 'Region_Name';

	let showResults = false;
	let inputElement;

	function handleInput(event) {
		searchQuery.set(event.target.value);
		showResults = event.target.value.length >= 2;
	}

	function handleSelectResult(region) {
		const idField = mapConfig.fields?.metrics?.idField || 'GeoUID';
		selectRegion(region[idField]);
		searchQuery.set('');
		showResults = false;
		inputElement?.blur();
	}

	function handleBlur() {
		// Delay to allow click on results
		setTimeout(() => {
			showResults = false;
		}, 200);
	}

	function handleClear() {
		searchQuery.set('');
		showResults = false;
	}
</script>

<div class="search-bar">
	<div class="search-input-wrapper">
		<svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
				clip-rule="evenodd"
			/>
		</svg>
		<input
			bind:this={inputElement}
			type="text"
			{placeholder}
			value={$searchQuery}
			on:input={handleInput}
			on:blur={handleBlur}
			on:focus={() => ($searchQuery.length >= 2 ? (showResults = true) : null)}
		/>
		{#if $searchQuery}
			<button class="clear-btn" on:click={handleClear} title="Clear search">×</button>
		{/if}
	</div>

	{#if showResults && $searchResults.length > 0}
		<div class="search-results">
			{#each $searchResults as result}
				<button class="result-item" on:click={() => handleSelectResult(result)}>
					<span class="result-name">{result[nameField]}</span>
					{#if result.Province_Name}
						<span class="result-province">{result.Province_Name}</span>
					{/if}
				</button>
			{/each}
		</div>
	{:else if showResults && $searchQuery.length >= 2}
		<div class="search-results">
			<div class="no-results">No regions found</div>
		</div>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		width: 100%;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		width: 1rem;
		height: 1rem;
		color: #999;
		pointer-events: none;
	}

	input {
		width: 100%;
		padding: 0.4rem 2rem 0.4rem 2.5rem; /* Adjusted padding */
		border: 1px solid #ddd;
		border-radius: 4px; /* Adjusted border-radius */
		font-size: 0.8125rem; /* Standardized font size (13px) */
		background: white;
		transition: all 0.2s;
	}

	input:hover {
		border-color: #999;
	}

	input:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
	}

	.clear-btn {
		position: absolute;
		right: 0.5rem;
		background: none;
		border: none;
		font-size: 1.125rem; /* Adjusted size */
		line-height: 1;
		cursor: pointer;
		color: #999;
		padding: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
	}

	.clear-btn:hover {
		background-color: #f0f0f0;
		color: #333;
	}

	.search-results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
	}

	.result-item {
		width: 100%;
		padding: 0.6rem 0.75rem; /* Adjusted padding */
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		transition: background-color 0.15s;
		border-bottom: 1px solid #f0f0f0;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-item:hover {
		background-color: #f8f9fa;
	}

	.result-name {
		font-size: 0.8125rem; /* Standardized font size */
		color: #333;
		font-weight: 500;
	}

	.result-province {
		font-size: 0.75rem;
		color: #999;
		white-space: nowrap;
	}

	.no-results {
		padding: 0.6rem 0.75rem; /* Adjusted padding */
		text-align: center;
		color: #999;
		font-size: 0.8125rem; /* Standardized font size */
		font-style: italic;
	}
</style>
