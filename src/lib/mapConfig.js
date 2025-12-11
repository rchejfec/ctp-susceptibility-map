/**
 * Map Configuration - CTP Susceptibility Map
 *
 * Community Transition Pathways (CTP) - Trade/Tariff Impact Susceptibility
 * Shows Import, Manufacturing, and Fossil Fuel susceptibility across Canadian census divisions
 */

export const mapConfig = {
	// ============================================================================
	// PROJECT METADATA
	// ============================================================================
	project: {
		title: '', // Empty for iframe use
		subtitle: '',
		description: 'Census Division Trade/Tariff Impact Susceptibility'
	},

	// ============================================================================
	// DATA SOURCES
	// ============================================================================
	data: {
		geometry: 'data/census_divisions.geojson',
		metrics: 'data/cd_metrics.csv',
		supplementary: 'data/cd_supplementary.csv' // NAICS sector details
	},

	// ============================================================================
	// FIELD MAPPING
	// ============================================================================
	fields: {
		geometry: {
			idField: 'GeoUID',
			nameField: 'CD_Name', // Changed from Region_Name
			provinceField: 'Province'
		},
		metrics: {
			idField: 'GeoUID',
			provinceField: 'Province'
		},
		supplementary: {
			idField: 'GeoUID',
			metricField: 'Metric'
		}
	},

	// ============================================================================
	// METRICS DEFINITIONS - 4 categorical metrics (0-5 scale)
	// ============================================================================
	metrics: [
		// Metric 1: Top Score (default metric, shown first in dropdown)
		{
			id: 'top_score',
			column: 'Top_Score',
			label: 'Top Score',
			description: 'Highest susceptibility score across all metrics',
			type: 'categorical',
			scatterYColumn: 'Top_Score_Normalized',

			scale: {
				categories: [0, 1, 2, 3, 4, 5],
				colors: {
					0: '#E0E0E0',
					1: '#B3CDE3',
					2: '#6497B1',
					3: '#FDB863',
					4: '#E08214',
					5: '#B2182B'
				},
				labels: {
					0: 'No susceptibility',
					1: 'Least susceptible (below mean)',
					2: 'Less susceptible (above mean)',
					3: 'Susceptible (top 10%)',
					4: 'More susceptible (top 5%)',
					5: 'Most susceptible (top 2%)'
				}
			},

			format: (value) => {
				const labels = {
					0: 'No susceptibility',
					1: 'Least susceptible',
					2: 'Less susceptible',
					3: 'Susceptible',
					4: 'More susceptible',
					5: 'Most susceptible'
				};
				return labels[value] || 'N/A';
			},

			tooltip: {
				fields: ['CD_Name', 'Top_Score', 'Top_Score_Normalized', 'Top_Metrics'],
				format: {
					Top_Score_Normalized: (val) => (val != null ? val.toFixed(3) : 'N/A')
				}
			}
		},

		// Metric 2: Import Susceptibility (IS)
		{
			id: 'import_susceptibility',
			column: 'IS',
			label: 'Import Susceptibility',
			description: 'Vulnerability to import disruptions',
			type: 'categorical',
			scatterYColumn: 'IS_score', // For scatter chart dynamic Y-axis

			scale: {
				categories: [0, 1, 2, 3, 4, 5],
				colors: {
					0: '#E0E0E0', // Gray - No susceptibility
					1: '#B3CDE3', // Light blue - Least susceptible
					2: '#6497B1', // Blue - Less susceptible
					3: '#FDB863', // Yellow - Susceptible
					4: '#E08214', // Orange - More susceptible
					5: '#B2182B' // Red - Most susceptible
				},
				labels: {
					0: 'No susceptibility',
					1: 'Least susceptible (below mean)',
					2: 'Less susceptible (above mean)',
					3: 'Susceptible (top 10%)',
					4: 'More susceptible (top 5%)',
					5: 'Most susceptible (top 2%)'
				}
			},

			format: (value) => {
				const labels = {
					0: 'No susceptibility',
					1: 'Least susceptible',
					2: 'Less susceptible',
					3: 'Susceptible',
					4: 'More susceptible',
					5: 'Most susceptible'
				};
				return labels[value] || 'N/A';
			},

			tooltip: {
				fields: ['CD_Name', 'IS', 'IS_score'],
				format: {
					IS_score: (val) => (val != null ? val.toFixed(3) : 'N/A')
				}
			}
		},

		// Metric 3: Manufacturing Susceptibility (MS)
		{
			id: 'manufacturing_susceptibility',
			column: 'MS',
			label: 'Manufacturing Susceptibility',
			description: 'Vulnerability to manufacturing disruptions',
			type: 'categorical',
			scatterYColumn: 'MS_score',

			scale: {
				categories: [0, 1, 2, 3, 4, 5],
				colors: {
					0: '#E0E0E0',
					1: '#B3CDE3',
					2: '#6497B1',
					3: '#FDB863',
					4: '#E08214',
					5: '#B2182B'
				},
				labels: {
					0: 'No susceptibility',
					1: 'Least susceptible (below mean)',
					2: 'Less susceptible (above mean)',
					3: 'Susceptible (top 10%)',
					4: 'More susceptible (top 5%)',
					5: 'Most susceptible (top 2%)'
				}
			},

			format: (value) => {
				const labels = {
					0: 'No susceptibility',
					1: 'Least susceptible',
					2: 'Less susceptible',
					3: 'Susceptible',
					4: 'More susceptible',
					5: 'Most susceptible'
				};
				return labels[value] || 'N/A';
			},

			tooltip: {
				fields: ['CD_Name', 'MS', 'MS_score'],
				format: {
					MS_score: (val) => (val != null ? val.toFixed(3) : 'N/A')
				}
			}
		},

		// Metric 4: Fossil Fuel Susceptibility (FS)
		{
			id: 'fossil_fuel_susceptibility',
			column: 'FS',
			label: 'Fossil Fuel Susceptibility',
			description: 'Vulnerability to fossil fuel sector impacts',
			type: 'categorical',
			scatterYColumn: 'FS_score',

			scale: {
				categories: [0, 1, 2, 3, 4, 5],
				colors: {
					0: '#E0E0E0',
					1: '#B3CDE3',
					2: '#6497B1',
					3: '#FDB863',
					4: '#E08214',
					5: '#B2182B'
				},
				labels: {
					0: 'No susceptibility',
					1: 'Least susceptible (below mean)',
					2: 'Less susceptible (above mean)',
					3: 'Susceptible (top 10%)',
					4: 'More susceptible (top 5%)',
					5: 'Most susceptible (top 2%)'
				}
			},

			format: (value) => {
				const labels = {
					0: 'No susceptibility',
					1: 'Least susceptible',
					2: 'Less susceptible',
					3: 'Susceptible',
					4: 'More susceptible',
					5: 'Most susceptible'
				};
				return labels[value] || 'N/A';
			},

			tooltip: {
				fields: ['CD_Name', 'FS', 'FS_score'],
				format: {
					FS_score: (val) => (val != null ? val.toFixed(3) : 'N/A')
				}
			}
		}
	],

	defaultMetric: 'top_score',

	// ============================================================================
	// LAYOUT CONFIGURATION
	// ============================================================================
	layout: {
		row1: {
			infoCardPlacement: 'row1-sidebar' // Info card in sidebar
		},
		row2: {
			enabled: true, // Explicitly enable Row 2
			components: {
				// Component 1: NAICS Detail Table (uses DetailPanel2 as infoCard2)
				infoCard2: {
					width: 1,
					order: 0
				},
				// Component 2: Stacked Bar Chart
				barChart: {
					width: 1,
					order: 1
				},
				// Component 3: Scatter Chart
				scatterChart: {
					width: 1,
					order: 2
				}
			}
		}
	},

	// ============================================================================
	// MAP STYLING
	// ============================================================================
	style: {
		fillOpacity: 0.7,
		borderColor: '#333',
		borderWidth: 0.5,
		hoverBorderColor: '#000',
		hoverBorderWidth: 2,
		selectedBorderColor: '#FFD700',
		selectedBorderWidth: 3,
		highlightedBorderColor: '#FF6B6B',
		highlightedBorderWidth: 2.5
	},

	// ============================================================================
	// MAP VIEWPORT
	// ============================================================================
	viewport: {
		bounds: [-141, 41.5, -52, 70],
		padding: 20,
		maxZoom: 6,
		provincePadding: 50,
		provinceMaxZoom: 7
	},

	// ============================================================================
	// UI FEATURES
	// ============================================================================
	features: {
		metricSwitcher: {
			enabled: true,
			position: 'top',
			style: 'dropdown'
		},

		provinceFilter: {
			enabled: true,
			label: 'Filter by Province',
			includeAll: true,
			allLabel: 'All Canada'
		},

		searchBar: {
			enabled: true,
			placeholder: 'Search census divisions...',
			searchFields: ['CD_Name'],
			fuzzyMatch: true,
			maxResults: 10
		},

		infoCard: {
			enabled: true,
			clearButton: true,
			exportButton: false
		},

		legend: {
			enabled: true,
			position: 'bottom-right'
		}
	},

	// ============================================================================
	// DETAIL PANELS
	// ============================================================================
	detailPanels: [
		// Panel 1: Simple Display Card (in sidebar)
		{
			id: 'basic_info',
			title: 'Region Details',
			type: 'fields',
			fields: [
				{ key: 'Province_Name', label: 'Province' },
				{ key: 'Labour_Force', label: 'Labour Force' },
				{ key: 'Top_Score', label: 'Top Score' },
				{ key: 'Top_Metrics', label: 'Top Score Metric(s)' }
			],
			format: (value, field) => {
				if (value == null || value === '') return 'N/A';
				if (field.key === 'Labour_Force' && typeof value === 'number') {
					return value.toLocaleString();
				}
				return value;
			}
		},

		// Panel 2: NAICS Detail Table (for DetailPanel2 in Row 2)
		{
			id: 'naics_detail',
			title: 'Sector Details',
			type: 'custom',
			template: 'table'
			// Filter-aware by selected metric (handled in DetailPanel2)
		}
	],

	// ============================================================================
	// CHARTS CONFIGURATION
	// ============================================================================
	charts: {
		// Stacked Bar Chart - Share of PT labour force by susceptibility category
		barChart: {
			enabled: true,
			title: 'Share of PT Labour Force in High Susceptibility CDs',
			position: 'row2',

			// Data configuration
			groupBy: 'Province_Name',
			aggregateColumn: 'Labour_Force',
			aggregateFunction: 'share_by_category', // Custom function (to be implemented)
			filterConfig: {
				scoreThreshold: 3,
				categories: [3, 4, 5],
				asPercentage: true
			},

			// Axis configuration
			orientation: 'horizontal',
			xLabel: 'Share of PT Labour Force (%) →',
			yLabel: null,
			xFormat: '.1%', // Percentage format

			// Styling
			sort: 'descending',
			stacked: true, // Enable stacked bars
			colorBy: 'category', // Color by score category
			colors: {
				3: '#FDB863', // Yellow
				4: '#E08214', // Orange
				5: '#B2182B' // Red
			},
			barColor: '#4A90E2', // Fallback (not used with colorBy)
			highlightColor: '#FFD700',
			selectedColor: '#FF6B6B',
			dimOpacity: 0.3,
			height: 300,

			// Interactions
			clickToFilter: false,
			linkedHighlight: true
		},

		// Scatter Plot - Labour Force vs Susceptibility Score
		scatterChart: {
			enabled: true,
			title: 'Labour Force vs Susceptibility Score',
			position: 'row2',

			// Data configuration - yColumn is dynamic via scatterYColumn
			xColumn: 'Labour_Force',
			yColumn: 'IS_score', // Default, will be overridden by scatterYColumn

			// Axis configuration
			xLabel: 'Labour Force (2021) →',
			yLabel: '↑ Susceptibility Score (0-1)',
			xScale: 'log',
			yScale: 'linear',
			xFormat: '~s',
			yFormat: '.2f',

			// Styling
			pointColor: '#4A90E2',
			pointRadius: 4,
			highlightColor: '#FFD700',
			highlightRadius: 6,
			selectedColor: '#FF6B6B',
			selectedRadius: 7,
			height: 300,

			// Interactions
			linkedHighlight: true,
			showTooltip: true
		}
	}
};

// ============================================================================
// PROVINCE REFERENCE DATA
// ============================================================================
export const provinceNames = {
	'10': 'Newfoundland and Labrador',
	'11': 'Prince Edward Island',
	'12': 'Nova Scotia',
	'13': 'New Brunswick',
	'24': 'Quebec',
	'35': 'Ontario',
	'46': 'Manitoba',
	'47': 'Saskatchewan',
	'48': 'Alberta',
	'59': 'British Columbia',
	'60': 'Yukon',
	'61': 'Northwest Territories',
	'62': 'Nunavut'
};

// ============================================================================
// REGION GROUPS
// ============================================================================
export const northernRegions = {
	ontario: [
		'3548',
		'3549',
		'3551',
		'3552',
		'3553',
		'3554',
		'3556',
		'3557',
		'3558',
		'3559',
		'3560'
	],
	quebec: [
		'2491',
		'2492',
		'2493',
		'2494',
		'2495',
		'2496',
		'2497',
		'2498',
		'2499'
	]
};

export const regionGroups = {
	'southern-quebec': {
		id: 'southern-quebec',
		label: 'Southern Quebec',
		provinceCode: '24',
		provinceName: 'Quebec',
		excludeRegions: northernRegions.quebec
	},
	'southern-ontario': {
		id: 'southern-ontario',
		label: 'Southern Ontario',
		provinceCode: '35',
		provinceName: 'Ontario',
		excludeRegions: northernRegions.ontario
	}
};

mapConfig.regionGroups = {
	enabled: true,
	groups: regionGroups
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function getMetricConfig(metricId) {
	return mapConfig.metrics.find((m) => m.id === metricId) || mapConfig.metrics[0];
}

export function getEnabledCharts() {
	const enabled = {};
	if (mapConfig.charts?.barChart?.enabled) {
		enabled.barChart = mapConfig.charts.barChart;
	}
	if (mapConfig.charts?.scatterChart?.enabled) {
		enabled.scatterChart = mapConfig.charts.scatterChart;
	}
	return enabled;
}
