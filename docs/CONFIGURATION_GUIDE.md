# Configuration Guide

This guide explains how to configure the mapping framework for your specific project without modifying component code.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration Structure](#configuration-structure)
4. [Feature Guide](#feature-guide)
5. [Example Configurations](#example-configurations)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The mapping framework is fully configurable through `src/lib/mapConfig.js`. This single file controls:

- **Data sources** - Where to load geometry and metrics
- **Metrics definitions** - What metrics to display and how
- **UI features** - Which controls and components to show
- **Styling** - Colors, borders, highlights
- **Charts** - What visualizations to render

**Key Principle:** The framework never knows about your specific domain (CTP scores, industries, census data, etc.). It only knows about generic concepts like "metrics", "regions", and "filters".

---

## Quick Start

### Workflow for a New Project

1. **Prepare your data** following the [Data Schema](src/lib/DATA_SCHEMA.md)
   - Transform raw data to match expected structure
   - Place files in `static/data/`

2. **Configure mapConfig.js**
   - Update `data` section with file paths
   - Define your metrics in `metrics` array
   - Customize `fields` mapping for your column names
   - Enable/disable features as needed

3. **Test and iterate**
   - Run `npm run dev`
   - Verify data loads correctly
   - Adjust colors, labels, and layout

---

## Configuration Structure

### Top-Level Sections

```javascript
export const mapConfig = {
  project: { /* Metadata */ },
  data: { /* File paths */ },
  fields: { /* Column name mapping */ },
  metrics: [ /* Metric definitions */ ],
  defaultMetric: 'metric_id',
  style: { /* Map styling */ },
  viewport: { /* Map bounds */ },
  features: { /* UI toggles */ },
  detailPanels: [ /* Sidebar sections */ ],
  charts: { /* Visualization config */ }
};
```

---

## Feature Guide

### 1. Project Metadata

```javascript
project: {
  title: 'Your Project Title',
  subtitle: 'Brief description',
  description: 'Longer description (optional)'
}
```

- **title**: Shown in header and browser tab
- **subtitle**: Shown below title
- **description**: Metadata only (not currently displayed)

---

### 2. Data Sources

```javascript
data: {
  geometry: 'data/your_regions.geojson',
  metrics: 'data/your_metrics.csv',
  supplementary: 'data/your_supplementary.csv' // optional
}
```

- **geometry**: GeoJSON file with polygon boundaries
- **metrics**: CSV with primary metrics
- **supplementary**: Optional CSV for filter-aware detail panels

**Path resolution:** Relative to `static/` directory

---

### 3. Field Mapping

Tell the framework which columns to use:

```javascript
fields: {
  geometry: {
    idField: 'region_id',        // Join key
    nameField: 'region_name',     // Display name
    provinceField: 'province_code' // For filtering
  },
  metrics: {
    idField: 'region_id',          // Must match geometry.idField VALUES
    provinceField: 'province_code' // For filtering
  }
}
```

**Critical:** The `idField` values must match between geometry and metrics for the join to work.

---

### 4. Metrics Definitions

Define each metric you want to visualize:

```javascript
metrics: [
  {
    id: 'unique_metric_id',
    column: 'csv_column_name',
    label: 'Display Name',
    description: 'Tooltip text',
    type: 'continuous', // or 'categorical'

    // For continuous metrics
    scale: {
      colors: [
        [0, '#ffffcc'],
        [50, '#a1dab4'],
        [100, '#41b6c4'],
        [150, '#225ea8']
      ],
      legendLabels: [ // Optional
        { min: 100, label: '> 100' },
        { min: 50, max: 100, label: '50 - 100' },
        { max: 50, label: '< 50' }
      ]
    },

    // Format function for display
    format: (value) => value?.toLocaleString() || 'N/A',

    // Tooltip configuration
    tooltip: {
      fields: ['region_name', 'csv_column_name'],
      format: {
        csv_column_name: (val) => val?.toLocaleString() || 'N/A'
      }
    }
  }
]
```

**Metric Types:**

- **continuous**: Numeric values with interpolated color scale
- **categorical**: Discrete categories with fixed colors

**Color Scales:**

- Continuous: Array of `[value, color]` pairs for interpolation
- Categorical: Object mapping category names to colors

---

### 5. Map Styling

```javascript
style: {
  fillOpacity: 0.7,
  borderColor: '#333',
  borderWidth: 0.5,
  hoverBorderColor: '#000',
  hoverBorderWidth: 2,
  selectedBorderColor: '#FFD700',
  selectedBorderWidth: 3,
  highlightedBorderColor: '#FF6B6B', // Chart hover
  highlightedBorderWidth: 2.5
}
```

**Visual States:**

- **Default**: `fillOpacity`, `borderColor`, `borderWidth`
- **Hover**: `hoverBorderColor`, `hoverBorderWidth` (currently not implemented, but available for customization)
- **Selected**: `selectedBorderColor`, `selectedBorderWidth` (gold outline when clicked)
- **Highlighted**: `highlightedBorderColor`, `highlightedBorderWidth` (from chart interactions)

---

### 6. Map Viewport

```javascript
viewport: {
  bounds: [-141, 41.5, -52, 70], // [west, south, east, north]
  padding: 20,
  maxZoom: 6,
  provincePadding: 50,
  provinceMaxZoom: 7
}
```

- **bounds**: Initial view extent (covers all regions)
- **padding**: Pixels around bounds
- **maxZoom**: Prevents zooming too close
- **provincePadding**: Padding when filtering to province
- **provinceMaxZoom**: Max zoom for province view

---

### 7. UI Features

Control which components appear:

```javascript
features: {
  metricSwitcher: {
    enabled: true,
    position: 'top',      // 'top' or 'sidebar'
    style: 'dropdown'     // 'dropdown' or 'tabs'
  },

  provinceFilter: {
    enabled: true,
    label: 'Filter by Province',
    includeAll: true,
    allLabel: 'All Canada'
  },

  searchBar: {
    enabled: true,
    placeholder: 'Search regions...',
    searchFields: ['Region_Name'],
    fuzzyMatch: true,
    maxResults: 10
  },

  legend: {
    enabled: true,
    position: 'bottom-right' // 'bottom-right', 'bottom-left', 'sidebar'
  }
}
```

**Feature Toggles:**

- Set `enabled: false` to hide a feature
- Customize labels, placeholders, and behavior
- Framework adapts layout based on enabled features

---

### 8. Detail Panels

Configure sidebar sections that show region details:

```javascript
detailPanels: [
  // Basic field display
  {
    id: 'basic_info',
    title: 'Selected Region',
    type: 'fields',
    fields: [
      { key: 'csv_column_1', label: 'Population' },
      { key: 'csv_column_2', label: 'Income', prefix: '$' },
      { key: 'csv_column_3', label: 'Growth', suffix: '%' }
    ],
    format: (value, field) => {
      // Custom formatting function (optional)
      if (value == null) return 'N/A';
      const prefix = field.prefix || '';
      const suffix = field.suffix || '';
      return typeof value === 'number'
        ? `${prefix}${value.toLocaleString()}${suffix}`
        : `${prefix}${value}${suffix}`;
    }
  },

  // Custom panel with supplementary data
  {
    id: 'top_industries',
    title: 'Top Industries',
    type: 'custom',
    filterBy: ['metric'], // Show different data per metric
    template: 'list' // 'list' or 'table'
  }
]
```

**Panel Types:**

- **fields**: Simple key-value display from metrics data
- **custom**: Render supplementary data (requires supplementary.csv)

**Templates for Custom Panels:**

- **list**: Ranked list with optional values
- **table**: Tabular display

---

### 9. Charts Configuration

Add D3 visualizations with linked highlighting:

```javascript
charts: {
  // Horizontal bar chart
  barChart: {
    enabled: true,
    title: 'by Province',
    position: 'bottom',

    groupBy: 'Province_Name',
    aggregateColumn: 'metric_column',
    aggregateFunction: 'sum', // 'sum', 'mean', 'median', 'count'

    orientation: 'horizontal',
    xLabel: 'Total Population →',
    xFormat: '~s', // D3 format string

    sort: 'descending',
    barColor: '#4A90E2',
    highlightColor: '#FFD700',
    height: 300,

    clickToFilter: false,
    linkedHighlight: true
  },

  // Scatter plot
  scatterChart: {
    enabled: false,
    title: 'Population vs Income',
    position: 'bottom',

    xColumn: 'population',
    yColumn: 'income',
    sizeColumn: null,
    colorColumn: null,

    xLabel: 'Population →',
    yLabel: '↑ Income ($)',
    xScale: 'log', // 'linear' or 'log'
    yScale: 'linear',
    xFormat: '~s',
    yFormat: (d) => `$${d.toLocaleString()}`,

    pointColor: '#4A90E2',
    pointRadius: 4,
    highlightColor: '#FFD700',
    highlightRadius: 6,
    height: 300,

    linkedHighlight: true,
    showTooltip: true
  }
}
```

**Linked Highlighting:**

- When enabled, hovering over chart elements highlights corresponding regions on the map
- Hovering over map regions doesn't currently trigger chart highlights (can be added if needed)

**D3 Format Strings:**

- `~s`: SI-prefix with automatic precision (1K, 1M, 1G)
- `.2f`: Fixed 2 decimal places
- `.0%`: Percentage with no decimal places
- [Full D3 format reference](https://github.com/d3/d3-format)

---

## Example Configurations

### Example 1: Single Metric, No Charts

```javascript
export const mapConfig = {
  project: {
    title: 'Simple Population Map',
    subtitle: 'Census 2021'
  },

  data: {
    geometry: 'data/regions.geojson',
    metrics: 'data/population.csv',
    supplementary: null
  },

  fields: {
    geometry: { idField: 'id', nameField: 'name', provinceField: 'prov' },
    metrics: { idField: 'id', provinceField: 'prov' }
  },

  metrics: [
    {
      id: 'pop',
      column: 'population',
      label: 'Population',
      type: 'continuous',
      scale: {
        colors: [
          [0, '#fee5d9'],
          [100000, '#fc8d59'],
          [500000, '#e34a33'],
          [2000000, '#b30000']
        ]
      },
      format: (v) => v?.toLocaleString() || 'N/A',
      tooltip: {
        fields: ['name', 'population'],
        format: { population: (v) => v?.toLocaleString() }
      }
    }
  ],

  defaultMetric: 'pop',

  features: {
    metricSwitcher: { enabled: false }, // Only one metric
    searchBar: { enabled: true },
    provinceFilter: { enabled: true },
    legend: { enabled: true }
  },

  detailPanels: [
    {
      id: 'info',
      title: 'Region Info',
      type: 'fields',
      fields: [{ key: 'population', label: 'Population' }]
    }
  ],

  charts: {
    barChart: { enabled: false },
    scatterChart: { enabled: false }
  }
};
```

---

### Example 2: Multi-Metric with Charts (Your Test Case 2)

```javascript
export const mapConfig = {
  project: {
    title: 'Economic Analysis',
    subtitle: 'Multiple metrics with linked visualizations'
  },

  data: {
    geometry: 'data/cd.geojson',
    metrics: 'data/economic_metrics.csv',
    supplementary: 'data/industry_breakdown.csv'
  },

  fields: {
    geometry: { idField: 'GeoUID', nameField: 'CD_Name', provinceField: 'PT' },
    metrics: { idField: 'GeoUID', provinceField: 'PT' }
  },

  metrics: [
    {
      id: 'innovation',
      column: 'innovation_score',
      label: 'Innovation Score',
      type: 'categorical',
      scale: {
        categories: {
          'Very High': '#1a9850',
          'High': '#91cf60',
          'Medium': '#ffffbf',
          'Low': '#fc8d59',
          'Very Low': '#d73027'
        }
      },
      format: (v) => v || 'N/A',
      tooltip: {
        fields: ['CD_Name', 'innovation_score'],
        format: {}
      }
    },
    {
      id: 'gdp',
      column: 'gdp_per_capita',
      label: 'GDP per Capita',
      type: 'continuous',
      scale: {
        colors: [[0, '#f7fbff'], [50000, '#6baed6'], [100000, '#08306b']]
      },
      format: (v) => v ? `$${v.toLocaleString()}` : 'N/A',
      tooltip: {
        fields: ['CD_Name', 'gdp_per_capita'],
        format: { gdp_per_capita: (v) => `$${v?.toLocaleString()}` }
      }
    }
  ],

  defaultMetric: 'innovation',

  features: {
    metricSwitcher: { enabled: true, style: 'tabs' },
    searchBar: { enabled: true },
    provinceFilter: { enabled: true },
    legend: { enabled: true }
  },

  detailPanels: [
    {
      id: 'basic',
      title: 'Basic Info',
      type: 'fields',
      fields: [
        { key: 'population', label: 'Population' },
        { key: 'gdp_per_capita', label: 'GDP/Capita', prefix: '$' }
      ]
    },
    {
      id: 'industries',
      title: 'Top Industries',
      type: 'custom',
      filterBy: ['metric'],
      template: 'list'
    }
  ],

  charts: {
    barChart: {
      enabled: true,
      title: 'by Province',
      groupBy: 'Province_Name',
      aggregateColumn: 'population', // Dynamic based on metric
      aggregateFunction: 'sum',
      orientation: 'horizontal',
      linkedHighlight: true
    },
    scatterChart: {
      enabled: true,
      title: 'Population vs GDP',
      xColumn: 'population',
      yColumn: 'gdp_per_capita',
      xScale: 'log',
      yScale: 'linear',
      linkedHighlight: true,
      showTooltip: true
    }
  }
};
```

---

## Troubleshooting

### Data Not Loading

**Problem:** Map is blank, no regions shown

**Solutions:**
1. Check file paths in `data` config (relative to `static/`)
2. Verify `idField` values match between geometry and metrics
3. Check browser console for errors
4. Ensure CSV has headers and proper formatting

### Colors Not Showing

**Problem:** Map regions are gray

**Solutions:**
1. Check metric `column` name matches CSV
2. Verify `type` is correct (`continuous` vs `categorical`)
3. For continuous: ensure numeric values and color scale covers data range
4. For categorical: ensure category names exactly match CSV values

### Metric Switcher Not Showing

**Problem:** Dropdown/tabs missing

**Solutions:**
1. Set `features.metricSwitcher.enabled: true`
2. Define multiple metrics in `metrics` array
3. Component only shows with 2+ metrics

### Charts Not Rendering

**Problem:** Chart area is empty

**Solutions:**
1. Set `charts.barChart.enabled: true`
2. Check `groupBy` and `aggregateColumn` match CSV columns
3. Verify data has numeric values for aggregation
4. Check browser console for D3 errors

### Search Bar Not Working

**Problem:** Typing doesn't find regions

**Solutions:**
1. Check `searchFields` contains valid column names
2. Verify column exists in metrics CSV
3. Minimum 2 characters required to trigger search

### Province Filter Shows "Unknown"

**Problem:** All regions labeled "Unknown" in filter

**Solutions:**
1. Check `provinceField` mapping in `fields.geometry` and `fields.metrics`
2. Ensure province codes match in both datasets
3. Update `provinceNames` export if using custom province mappings

---

## Advanced Topics

### Dynamic Chart Columns

To change what column a bar chart aggregates based on the selected metric:

1. The chart components read `aggregateColumn` from config
2. You can make this dynamic by having a reactive statement update the config
3. Or, manually update `charts.barChart.aggregateColumn` to match the current metric

**Example:**
```javascript
// In a component or store
$: if ($currentMetricConfig) {
  mapConfig.charts.barChart.aggregateColumn = $currentMetricConfig.column;
}
```

### Custom Detail Panel Templates

To add a new template type beyond 'list' and 'table':

1. Edit [DetailPanel.svelte](src/lib/components/DetailPanel.svelte)
2. Add new `{:else if panel.template === 'your_type'}` block
3. Render supplementary data as needed

### Adding New Feature Toggles

To add a new optional feature:

1. Add config in `features` section of mapConfig
2. Check `enabled` flag in the main page component
3. Conditionally render the new component

---

## Best Practices

1. **Start Simple:** Begin with one metric, no charts. Add complexity gradually.

2. **Validate Data Early:** Test data loading before styling/features.

3. **Use Descriptive IDs:** Metric IDs like `innovation_score` are clearer than `metric_1`.

4. **Match Column Names Exactly:** Typos in `column` or `fields` cause silent failures.

5. **Test Filtering:** Ensure province codes are consistent across datasets.

6. **Color Accessibility:** Use colorblind-friendly palettes (e.g., ColorBrewer).

7. **Format Consistently:** Use the same number formatting across tooltips, legends, and panels.

8. **Document Your Config:** Add comments explaining domain-specific choices.

---

## Next Steps

Once configured:

1. **Test locally**: `npm run dev`
2. **Verify all features**: Use [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
3. **Build for production**: `npm run build`
4. **Deploy**: Follow SvelteKit deployment docs for your platform

For data preparation guidance, see [DATA_SCHEMA.md](src/lib/DATA_SCHEMA.md).

For component internals, see individual component files in `src/lib/components/`.
