import { writable, derived, get } from 'svelte/store';
import { mapConfig } from '$lib/mapConfig.js';

/**
 * Application State Store
 *
 * Central state management for the map application
 * Supports multi-metric switching and linked highlighting
 */

// ============================================================================
// CORE DATA STORES
// ============================================================================

// Data stores
export const geoData = writable(null);
export const metricsData = writable(null);
export const supplementaryData = writable(null);

// Map instance reference
export const mapInstance = writable(null);

// ============================================================================
// UI STATE STORES
// ============================================================================

// Currently selected metric (by ID)
export const selectedMetric = writable(mapConfig.defaultMetric);

// Selected province filter (null = all provinces)
export const selectedProvince = writable(null);

// Selected census division (by ID, null = none selected)
export const selectedRegion = writable(null);

// Highlighted regions (array of IDs, for linked highlighting from charts)
export const highlightedRegions = writable([]);

// Hovered region (for tooltips)
export const hoveredRegion = writable(null);

// Search query
export const searchQuery = writable('');

// ============================================================================
// DERIVED STORES
// ============================================================================

/**
 * Current metric configuration
 */
export const currentMetricConfig = derived([selectedMetric], ([$selectedMetric]) => {
	return mapConfig.metrics.find((m) => m.id === $selectedMetric) || mapConfig.metrics[0];
});

/**
 * Filtered metrics based on selected province
 * Note: Region groups DON'T filter metrics (map-only filtering)
 */
export const filteredMetrics = derived(
	[metricsData, selectedProvince],
	([$metricsData, $selectedProvince]) => {
		if (!$metricsData) return [];
		if (!$selectedProvince) return $metricsData;

		// Don't filter charts for region groups (map-only filtering)
		if (isRegionGroup($selectedProvince)) {
			return $metricsData; // Return all data for charts
		}

		const provinceField = mapConfig?.fields?.metrics?.provinceField || 'Province';
		return $metricsData.filter((d) => d.Province_Name === $selectedProvince);
	}
);

/**
 * Search results based on query
 */
export const searchResults = derived(
	[metricsData, searchQuery],
	([$metricsData, $searchQuery]) => {
		if (!$metricsData || !$searchQuery || $searchQuery.length < 2) {
			return [];
		}

		const searchFields = mapConfig?.features?.searchBar?.searchFields || ['Region_Name'];
		const maxResults = mapConfig?.features?.searchBar?.maxResults || 10;
		const fuzzy = mapConfig?.features?.searchBar?.fuzzyMatch ?? true;

		const query = $searchQuery.toLowerCase();
		const results = $metricsData.filter((item) => {
			return searchFields.some((field) => {
				const value = String(item[field] || '').toLowerCase();
				return fuzzy ? value.includes(query) : value.startsWith(query);
			});
		});

		return results.slice(0, maxResults);
	}
);

/**
 * Selected region data (merged from metrics)
 */
export const selectedRegionData = derived(
	[metricsData, selectedRegion],
	([$metricsData, $selectedRegion]) => {
		if (!$metricsData || !$selectedRegion) return null;

		const idField = mapConfig?.fields?.metrics?.idField || 'GeoUID';
		return $metricsData.find((d) => String(d[idField]) === String($selectedRegion));
	}
);

/**
 * Supplementary data for selected region (NOT filter-aware by metric)
 * Filtering by metric happens in DetailPanel2 component
 */
export const selectedRegionSupplementary = derived(
	[supplementaryData, selectedRegion],
	([$supplementaryData, $selectedRegion]) => {
		if (!$supplementaryData || !$selectedRegion) return null;

		const idField = mapConfig.fields?.supplementary?.idField || 'GeoUID';

		// Filter supplementary data to match current region only
		return $supplementaryData.filter((d) => String(d[idField]) === String($selectedRegion));
	}
);

// ============================================================================
// STORE ACTIONS
// ============================================================================

/**
 * Clear selection when filtered out
 * This fixes the bug where selected regions persist when filtered
 */
export function clearSelectionIfFiltered(selectedRegionValue, filteredMetricsValue, config) {
	if (selectedRegionValue && filteredMetricsValue) {
		const idField = config?.fields?.metrics?.idField || 'GeoUID';
		const isStillVisible = filteredMetricsValue.some(
			(d) => String(d[idField]) === String(selectedRegionValue)
		);

		if (!isStillVisible) {
			selectedRegion.set(null);
		}
	}
}

/**
 * Switch to a different metric
 */
export function switchMetric(metricId) {
	selectedMetric.set(metricId);
	// Optionally clear selection when switching metrics
	// selectedRegion.set(null);
}

/**
 * Highlight regions (for linked highlighting from charts)
 */
export function highlightRegions(regionIds) {
	highlightedRegions.set(Array.isArray(regionIds) ? regionIds : [regionIds]);
}

/**
 * Clear all highlights
 */
export function clearHighlights() {
	highlightedRegions.set([]);
}

/**
 * Select a region and clear highlights
 * No longer auto-filters to province - keeps existing filters intact
 */
export function selectRegion(regionId) {
	selectedRegion.set(regionId);
	clearHighlights();
}

/**
 * Toggle region selection (click to select/deselect)
 * No longer changes province filter - keeps existing filters intact
 */
export function toggleRegionSelection(regionId) {
	const currentRegion = get(selectedRegion);

	if (currentRegion === regionId) {
		// Deselecting - clear region only, preserve filters
		selectedRegion.set(null);
	} else {
		// Selecting a new region - just set region, don't touch filters
		selectedRegion.set(regionId);
	}

	clearHighlights();
}

/**
 * Clear all filters and selections
 */
export function resetFilters() {
	selectedProvince.set(null);
	selectedRegion.set(null);
	clearHighlights();
	searchQuery.set('');
}

/**
 * Check if filter value is a region group
 */
export function isRegionGroup(value) {
	if (!value) return false;
	const groups = mapConfig.regionGroups?.groups || {};
	return Object.keys(groups).includes(value);
}

/**
 * Get region IDs for a filter value (if region group)
 */
export function getRegionGroupIds(filterValue) {
	if (!filterValue || !isRegionGroup(filterValue)) return null;
	return mapConfig.regionGroups?.groups?.[filterValue]?.regions || null;
}
