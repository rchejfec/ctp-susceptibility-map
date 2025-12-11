/**
 * Test Configurations for Different Layout Modes
 *
 * Each config demonstrates a different layout scenario
 */

import { mapConfig as baseConfig } from '$lib/mapConfig.js';

// ============================================================================
// TEST 1: Default (1 Row) - Map + Controls + Display
// ============================================================================
export const config1Row = {
	...baseConfig,
	project: {
		...baseConfig.project,
		title: 'Test 1: Default Layout (1 Row)',
		subtitle: 'Map + Controls + Info Card in Sidebar'
	},

	layout: {
		mode: 'sidebar',
		row1: {
			infoCardPlacement: 'row1-sidebar' // Info card in sidebar
		}
	},

	charts: {
		barChart: { enabled: false },
		scatterChart: { enabled: false }
	}
};

// ============================================================================
// TEST 2: Two-Column - Map + Controls + Display + 1 Figure
// ============================================================================
export const config2Column = {
	...baseConfig,
	project: {
		...baseConfig.project,
		title: 'Test 2: Two-Column Layout',
		subtitle: 'Map (full height) + Controls + Info + Bar Chart (stacked right)'
	},

	layout: {
		mode: 'two-column', // Two-column mode
		row2: {
			components: {
				infoCard: {
					order: 0 // First after controls
				},
				barChart: {
					order: 1 // Second
				}
			}
		}
	},

	charts: {
		barChart: {
			enabled: true,
			title: 'Population by Province',
			groupBy: 'Province_Name',
			aggregateColumn: 'Pop_2021',
			aggregateFunction: 'sum',
			orientation: 'horizontal',
			xLabel: 'Population →',
			xFormat: '~s',
			sort: 'descending',
			height: 300
		},
		scatterChart: { enabled: false }
	}
};

// ============================================================================
// TEST 3: Two-Row Complex - Map + Controls + Display + 2nd Display + 2 Figures
// ============================================================================
export const config2Row = {
	...baseConfig,
	project: {
		...baseConfig.project,
		title: 'Test 3: Two-Row Complex Layout',
		subtitle: 'Map + Controls (Row 1) + Display 1 (Row 1) | Display 2 + Bar Chart + Scatter Plot (Row 2)'
	},

	layout: {
		mode: 'sidebar',
		row1: {
			infoCardPlacement: 'row1-sidebar' // First display in sidebar
		},
		row2: {
			enabled: true,
			components: {
				// Second display panel (like info card but different content)
				infoCard2: {
					width: 1, // 1/3 width - equal to others
					align: 'start',
					maxWidth: '100%',
					order: 0 // First
				},
				barChart: {
					width: 1, // 1/3 width - equal to others
					order: 1 // Second
				},
				scatterChart: {
					width: 1, // 1/3 width - equal to others
					order: 2 // Third
				}
			}
		}
	},

	// Define the second info card content
	detailPanels: [
		// Panel 1: In sidebar (Row 1)
		{
			id: 'basic_info',
			title: 'Demographics',
			type: 'fields',
			fields: [
				{ key: 'Pop_2021', label: 'Population' },
				{ key: 'Labour_Force_Tot', label: 'Labour Force' }
			],
			format: (value, field) => {
				if (value == null || value === '') return 'N/A';
				const prefix = field.prefix || '';
				const suffix = field.suffix || '';
				if (typeof value === 'number') {
					return `${prefix}${value.toLocaleString()}${suffix}`;
				}
				return `${prefix}${value}${suffix}`;
			}
		},
		// Panel 2: In Row 2
		{
			id: 'economic_info',
			title: 'Economic Indicators',
			type: 'fields',
			fields: [
				{ key: 'Median_Hhold_Inc', label: 'Median Income', prefix: '$' },
				{ key: 'Pop_2021', label: 'Population' }
			],
			format: (value, field) => {
				if (value == null || value === '') return 'N/A';
				const prefix = field.prefix || '';
				const suffix = field.suffix || '';
				if (typeof value === 'number') {
					return `${prefix}${value.toLocaleString()}${suffix}`;
				}
				return `${prefix}${value}${suffix}`;
			}
		}
	],

	charts: {
		barChart: {
			enabled: true,
			title: 'Population by Province',
			groupBy: 'Province_Name',
			aggregateColumn: 'Pop_2021',
			aggregateFunction: 'sum',
			orientation: 'horizontal',
			xLabel: 'Population →',
			xFormat: '~s',
			sort: 'descending',
			height: 300
		},
		scatterChart: {
			enabled: true,
			title: 'Population vs Income',
			xColumn: 'Pop_2021',
			yColumn: 'Median_Hhold_Inc',
			xLabel: 'Population (2021) →',
			yLabel: '↑ Median Household Income ($)',
			xScale: 'log',
			yScale: 'linear',
			xFormat: '~s',
			yFormat: (d) => `$${d.toLocaleString()}`,
			height: 300
		}
	}
};
