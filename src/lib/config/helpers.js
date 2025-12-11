/**
 * Configuration Helper Functions
 *
 * Pure functions for working with the configuration system
 */

import {
	defaultLayout,
	defaultFeatures,
	defaultCharts,
	defaultStyle,
	defaultViewport
} from './defaults.js';

// ============================================================================
// DEEP MERGE UTILITY
// ============================================================================

/**
 * Deep merge two objects
 * Arrays are replaced, not merged
 */
export function deepMerge(target, source) {
	const output = { ...target };

	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					output[key] = source[key];
				} else {
					output[key] = deepMerge(target[key], source[key]);
				}
			} else {
				output[key] = source[key];
			}
		});
	}

	return output;
}

function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

// ============================================================================
// CONFIGURATION MERGING
// ============================================================================

/**
 * Get full configuration with defaults applied
 */
export function getFullConfig(userConfig) {
	// Merge layout carefully - preserve user's row2.components
	const layoutMerged = deepMerge(defaultLayout, userConfig.layout || {});

	// If user specified row2.components, use it directly (don't merge with empty array)
	if (userConfig.layout?.row2?.components) {
		layoutMerged.row2.components = userConfig.layout.row2.components;
	}

	const config = {
		...userConfig,
		layout: layoutMerged,
		features: deepMerge(defaultFeatures, userConfig.features || {}),
		charts: deepMerge(defaultCharts, userConfig.charts || {}),
		style: deepMerge(defaultStyle, userConfig.style || {}),
		viewport: deepMerge(defaultViewport, userConfig.viewport || {})
	};

	return config;
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Get all enabled Row 2 components in render order
 * In 'two-column' mode, this returns components for the right column
 */
export function getRow2Components(config) {
	const fullConfig = getFullConfig(config);
	const components = [];
	const isTwoColumnMode = fullConfig.layout.mode === 'two-column';

	// In two-column mode, info card always goes in right column (not sidebar)
	if (isTwoColumnMode && fullConfig.features.infoCard.enabled) {
		components.push({
			type: 'infoCard',
			...fullConfig.features.infoCard.row2Config
		});
	}
	// In sidebar mode, only include if explicitly placed in row2
	else if (!isTwoColumnMode && fullConfig.layout.row1.infoCardPlacement === 'row2') {
		components.push({
			type: 'infoCard',
			...fullConfig.features.infoCard.row2Config
		});
	}

	// Check for second info card (infoCard2) in row2
	if (fullConfig.layout.row2?.components?.infoCard2) {
		components.push({
			type: 'infoCard2',
			...fullConfig.layout.row2.components.infoCard2
		});
	}

	// Check for charts - in two-column mode, they go in right column
	Object.entries(fullConfig.charts).forEach(([chartType, chartConfig]) => {
		if (chartConfig.enabled) {
			// In two-column mode, all enabled charts go in right column
			// In sidebar mode, only if position === 'row2'
			if (isTwoColumnMode || chartConfig.position === 'row2') {
				// Check if user specified custom config for this chart in layout.row2.components
				const userChartConfig = fullConfig.layout.row2?.components?.[chartType];

				components.push({
					type: chartType,
					...chartConfig.row2Config,
					...(userChartConfig || {}) // User config overrides defaults
				});
			}
		}
	});

	// Sort by order
	components.sort((a, b) => (a.order || 0) - (b.order || 0));

	return components;
}

/**
 * Get CSS grid-template-columns for Row 2
 */
export function getRow2GridTemplate(config) {
	const components = getRow2Components(config);

	if (components.length === 0) {
		return '1fr';
	}

	// Build grid template from width ratios
	const template = components.map((c) => `${c.width || 1}fr`).join(' ');

	return template;
}

/**
 * Check if Row 2 should be displayed
 */
export function shouldShowRow2(config) {
	const fullConfig = getFullConfig(config);
	const row2Config = fullConfig.layout.row2;

	if (row2Config.enabled === false) return false;
	if (row2Config.enabled === true) return true;

	// 'auto' mode: show if any components enabled
	const components = getRow2Components(fullConfig);
	return components.length > 0;
}

/**
 * Check if info card is in sidebar (Row 1)
 */
export function isInfoCardInSidebar(config) {
	const fullConfig = getFullConfig(config);
	return fullConfig.features.infoCard.placement === 'row1-sidebar';
}

/**
 * Get Row 2 component by type
 */
export function getRow2ComponentConfig(config, componentType) {
	const components = getRow2Components(config);
	return components.find((c) => c.type === componentType);
}

// ============================================================================
// FEATURE HELPERS
// ============================================================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(config, featurePath) {
	const fullConfig = getFullConfig(config);
	const parts = featurePath.split('.');

	let current = fullConfig.features;
	for (const part of parts) {
		if (!current || typeof current !== 'object') return false;
		current = current[part];
	}

	return current?.enabled ?? false;
}

/**
 * Get controls components in render order
 */
export function getControlsComponents(config) {
	const fullConfig = getFullConfig(config);
	const controls = fullConfig.features.controls;

	const components = [];

	// Build array of enabled controls with position
	if (controls.metricSwitcher?.enabled) {
		components.push({ type: 'metricSwitcher', ...controls.metricSwitcher });
	}
	if (controls.searchBar?.enabled) {
		components.push({ type: 'searchBar', ...controls.searchBar });
	}
	if (controls.provinceFilter?.enabled) {
		components.push({ type: 'provinceFilter', ...controls.provinceFilter });
	}

	// Sort by position (top, middle, bottom)
	const positionOrder = { top: 0, middle: 1, bottom: 2 };
	components.sort((a, b) => (positionOrder[a.position] || 1) - (positionOrder[b.position] || 1));

	return components;
}

// ============================================================================
// METRIC HELPERS
// ============================================================================

/**
 * Get metric configuration by ID
 */
export function getMetricConfig(config, metricId) {
	return config.metrics?.find((m) => m.id === metricId) || config.metrics?.[0] || null;
}

/**
 * Get default metric ID
 */
export function getDefaultMetricId(config) {
	return config.defaultMetric || config.metrics?.[0]?.id || null;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate configuration and return errors/warnings
 */
export function validateConfig(config) {
	const errors = [];
	const warnings = [];

	// Required fields
	if (!config.data?.geometry) {
		errors.push('data.geometry is required');
	}
	if (!config.data?.metrics) {
		errors.push('data.metrics is required');
	}
	if (!config.metrics || config.metrics.length === 0) {
		errors.push('At least one metric must be defined');
	}

	// Row 2 components
	const row2Components = getRow2Components(config);
	if (row2Components.length > 3) {
		warnings.push(`Row 2 has ${row2Components.length} components (recommended max: 3)`);
	}

	// Check for width ratios
	const totalWidth = row2Components.reduce((sum, c) => sum + (c.width || 0), 0);
	if (totalWidth === 0 && row2Components.length > 0) {
		warnings.push('Row 2 components have no width defined');
	}

	// Chart configurations
	const fullConfig = getFullConfig(config);
	if (fullConfig.charts.scatterChart?.enabled) {
		if (!fullConfig.charts.scatterChart.xColumn || !fullConfig.charts.scatterChart.yColumn) {
			errors.push('scatterChart.xColumn and yColumn are required when enabled');
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}

/**
 * Log validation results to console
 */
export function logValidation(config) {
	const { valid, errors, warnings } = validateConfig(config);

	if (errors.length > 0) {
		console.error('Configuration Errors:');
		errors.forEach((err) => console.error(`  ❌ ${err}`));
	}

	if (warnings.length > 0) {
		console.warn('Configuration Warnings:');
		warnings.forEach((warn) => console.warn(`  ⚠️ ${warn}`));
	}

	if (valid && warnings.length === 0) {
		console.log('✅ Configuration valid');
	}

	return valid;
}

// ============================================================================
// RESPONSIVE HELPERS
// ============================================================================

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(config, windowWidth) {
	const fullConfig = getFullConfig(config);
	const breakpoints = fullConfig.layout.responsive.breakpoints;

	if (windowWidth < breakpoints.mobile) return 'mobile';
	if (windowWidth < breakpoints.tablet) return 'tablet';
	return 'desktop';
}

/**
 * Check if we're on mobile/tablet
 */
export function isMobileLayout(windowWidth) {
	return windowWidth < 1200;
}
