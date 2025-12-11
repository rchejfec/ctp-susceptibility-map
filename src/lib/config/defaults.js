/**
 * Framework Default Configuration
 *
 * These are sensible defaults that ensure the app never breaks.
 * User config in mapConfig.js deep-merges with these defaults.
 */

// ============================================================================
// LAYOUT DEFAULTS
// ============================================================================

export const defaultLayout = {
	// Layout mode: 'sidebar' or 'two-column'
	// 'sidebar' = Map on left, sidebar on right, optional Row 2 below
	// 'two-column' = Map on left (full height), stacked components on right (full height)
	mode: 'sidebar',

	row1: {
		// Height behavior
		heightMode: 'viewport', // 'viewport' | 'content' | 'fixed'
		minHeight: '500px',
		maxHeight: '70vh',

		// Column structure (desktop)
		columns: {
			map: {
				flex: 1, // Takes remaining space
				minWidth: '600px'
			},
			sidebar: {
				width: '320px', // Fixed width
				minWidth: '280px',
				maxWidth: '400px'
			}
		},

		// Sidebar components (order matters)
		sidebarComponents: [
			{ type: 'controls', required: true },
			{ type: 'infoCard', required: false }
		]
	},

	row2: {
		// Visibility
		enabled: 'auto', // 'auto' | true | false
		// 'auto' = show if any components enabled

		// Components array (user configures this)
		components: [],

		// Layout behavior
		gap: '1rem',
		heightMode: 'content', // Row 2 is content-driven
		maxHeight: '40vh',

		// Responsive collapse
		collapseMode: 'stack', // 'stack' | 'hide' | 'tabs'
		collapseBreakpoint: 768
	},

	responsive: {
		breakpoints: {
			mobile: 768,
			tablet: 1200,
			desktop: 1920
		}
	}
};

// ============================================================================
// FEATURE DEFAULTS
// ============================================================================

export const defaultFeatures = {
	controls: {
		card: {
			enabled: true,
			title: 'Controls',
			collapsible: false,
			defaultExpanded: true
		},

		metricSwitcher: {
			enabled: true,
			style: 'dropdown', // 'dropdown' | 'tabs' | 'radio'
			position: 'top', // Order within controls card
			label: 'Select Metric',
			showDescription: false
		},

		searchBar: {
			enabled: true,
			position: 'middle',
			placeholder: 'Search regions...',
			searchFields: ['Region_Name'],
			fuzzyMatch: true,
			maxResults: 10,
			highlightMatches: true
		},

		provinceFilter: {
			enabled: true,
			position: 'bottom',
			label: 'Filter by Province',
			includeAll: true,
			allLabel: 'All Canada',
			autoZoom: true
		}
	},

	infoCard: {
		enabled: true,

		// SIMPLE: User manually configures where it goes
		placement: 'row1-sidebar', // 'row1-sidebar' | 'row2'

		// If placed in row2
		row2Config: {
			width: 1, // Width ratio if moved to Row 2
			align: 'center', // 'start' | 'center' | 'end'
			maxWidth: '50%',
			order: 0 // Render order (lower = first)
		},

		// Content configuration
		content: {
			showTitle: true,
			title: 'Selected Region',
			emptyState: 'Select a region to view details',
			fields: [] // User configures in mapConfig
		},

		// Interaction
		clearButton: true,
		exportButton: false
	},

	legend: {
		enabled: true,

		// Position
		position: 'overlay', // 'overlay' | 'sidebar' | 'row2'
		overlay: {
			location: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
			offset: { x: 20, y: 20 }
		},

		// Style
		style: 'compact', // 'compact' | 'expanded'
		background: 'rgba(255, 255, 255, 0.85)',
		backdrop: true, // Backdrop blur

		// Content
		showTitle: true,
		title: 'auto', // 'auto' uses metric label, or custom string
		format: 'auto', // Uses metric format function

		// Behavior
		collapsible: false,
		draggable: false
	},

	map: {
		enabled: true,
		controls: {
			zoom: true,
			reset: true,
			fullscreen: false
		}
	}
};

// ============================================================================
// CHART DEFAULTS
// ============================================================================

export const defaultCharts = {
	barChart: {
		enabled: false,
		title: 'by Province',
		position: 'row2', // Where it renders

		// Row 2 placement
		row2Config: {
			width: 2, // Width ratio
			minWidth: '400px',
			order: 1
		},

		// Data configuration
		groupBy: 'Province_Name',
		aggregateColumn: 'Pop_2021', // Changes with metric
		aggregateFunction: 'sum', // 'sum', 'mean', 'median', 'count'

		// Axis configuration
		orientation: 'horizontal',
		xLabel: null,
		yLabel: null,
		xFormat: '~s',

		// Styling
		sort: 'descending',
		barColor: '#4A90E2',
		highlightColor: '#FFD700',
		height: 300,

		// Interactions
		clickToFilter: false,
		linkedHighlight: true
	},

	scatterChart: {
		enabled: false,
		title: 'Scatter Plot',
		position: 'row2',

		// Row 2 placement
		row2Config: {
			width: 1,
			minWidth: '300px',
			order: 2
		},

		// Data configuration
		xColumn: null, // User must configure
		yColumn: null,
		sizeColumn: null,
		colorColumn: null,

		// Axis configuration
		xLabel: null,
		yLabel: null,
		xScale: 'linear',
		yScale: 'linear',
		xFormat: '~s',
		yFormat: '~s',

		// Styling
		pointColor: '#4A90E2',
		pointRadius: 4,
		highlightColor: '#FFD700',
		highlightRadius: 6,
		height: 300,

		// Interactions
		linkedHighlight: true,
		showTooltip: true
	},

	table: {
		enabled: false,
		title: 'Data Table',
		position: 'row2',

		// Row 2 placement
		row2Config: {
			width: 1,
			minWidth: '400px',
			order: 3
		},

		// Content
		columns: [], // User configures
		sortable: true,
		searchable: true,
		pagination: true,
		rowsPerPage: 10,

		// Styling
		height: 300,
		scrollable: true // Tables are allowed to scroll!
	}
};

// ============================================================================
// STYLE DEFAULTS
// ============================================================================

export const defaultStyle = {
	fillOpacity: 0.7,
	borderColor: '#333',
	borderWidth: 0.5,
	hoverBorderColor: '#000',
	hoverBorderWidth: 2,
	selectedBorderColor: '#FFD700',
	selectedBorderWidth: 3,
	highlightedBorderColor: '#FF6B6B',
	highlightedBorderWidth: 2.5
};

// ============================================================================
// VIEWPORT DEFAULTS
// ============================================================================

export const defaultViewport = {
	bounds: [-141, 41.5, -52, 70], // Canada bounds
	padding: 20,
	maxZoom: 6,
	provincePadding: 50,
	provinceMaxZoom: 7
};
