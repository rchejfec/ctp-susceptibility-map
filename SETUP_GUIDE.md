# Setup Guide: Create a New Map from This Template

**For:** Humans or AI agents creating a new Census Division map project
**Approach:** Clone this template repository and customize it for your data
**Time:** 30-60 minutes for first setup

---

## Understanding This Template

This repository is a **template** for creating Census Division (CD) level choropleth maps. You will:

1. **Clone/copy the entire repository** to start a new project
2. **Replace the data files** with your own datasets
3. **Configure** `src/lib/mapConfig.js` to match your data
4. **Customize** layout and visualization options

**Key insight:** Most projects use **multiple datasets**:
- **Primary metrics CSV** - The aggregate scores/metrics to visualize on the map
- **GeoJSON boundaries** - Census Division polygons (usually stays the same)
- **Supplementary CSV** (optional) - Detailed breakdowns (by industry, category, etc.) for info cards and tables

---

## Prerequisites

### Required
- Node.js 18+ installed
- Your Census Division metrics data (CSV, Excel, or database export)
- Understanding of what you want to visualize

### Included in Template
✅ Census Division GeoJSON boundaries (2021)
✅ Sample metrics CSV with population data
✅ Fully configured example (population map)
✅ All dependencies in package.json

---

## Quick Start: 5 Steps

```
Clone Template → Prepare Data → Configure → Test → Deploy
     (1)            (2)          (3)      (4)    (5)
```

---

## Step 1: Clone This Template (5 min)

### Option A: Use as GitHub Template

If this is a GitHub repository:
```bash
# Click "Use this template" button on GitHub
# Or clone it:
git clone https://github.com/your-org/pb_map_base.git my-new-map
cd my-new-map
rm -rf .git  # Remove git history to start fresh
git init     # Initialize new repo
```

### Option B: Direct Copy

```bash
# Copy the entire directory
cp -r pb_map_base my-new-map
cd my-new-map

# Install dependencies
npm install
```

### Verify Template Works

```bash
npm run dev
```

Visit http://localhost:5173 - You should see the example population map.

**What you're seeing:** The template's example using sample Census Division data.

---

## Step 2: Understand Your Data Architecture (10 min)

### The Two-Dataset Pattern

Most projects follow this pattern:

**Dataset 1: Primary Metrics (Required)**
- Your main scores/metrics to visualize
- One row per Census Division
- Example: Innovation scores, risk ratings, economic indicators

**Dataset 2: Supplementary Details (Optional)**
- Breakdowns or contributors to the scores
- Multiple rows per Census Division
- Example: Top 5 industries contributing to innovation score
- Used in detail panels and tables

### Example Scenario

**Project:** Innovation Capacity Map

**Primary metrics CSV:** `innovation_scores.csv`
```csv
GeoUID,Province,Region_Name,Innovation_Score,GDP_Per_Capita,Population
3521,35,Ottawa,78.5,95000,1017449
2466,24,Montreal,72.3,88000,2030000
```
- One row per CD
- Contains the main metrics to visualize
- Used for: Map colors, legend, chart aggregations

**Supplementary CSV:** `innovation_contributors.csv`
```csv
GeoUID,metric_id,rank,industry,contribution
3521,innovation,1,Technology,45.2
3521,innovation,2,Healthcare,23.1
3521,innovation,3,Manufacturing,18.7
2466,innovation,1,Aerospace,38.9
2466,innovation,2,Pharma,29.3
```
- Multiple rows per CD
- Shows what contributes to the score
- Used for: Detail panel lists/tables showing "Top Industries"

### Your Data Audit

Answer these questions:

**Primary Metrics:**
- [ ] What are your main metrics? (Names, types: continuous/categorical)
- [ ] Do you have Census Division identifiers? (GeoUID)
- [ ] Do you have province codes? (Two-digit: 35, 24, etc. Also the first two digits of the CD identifiers.)
- [ ] How many metrics? (1, 3, 5+?)

**Supplementary Data (if applicable):**
- [ ] Do you want to show breakdowns in detail panels?
- [ ] What dimensions? (By industry, sector, category, time period?)
- [ ] Is it metric-specific? (Different lists for different metrics?)

---

## Step 3: Prepare Your Data Files (15 min)

### A. Keep or Update the GeoJSON

The template includes `static/data/census_divisions.geojson` (2021 boundaries).

**In most cases:** Keep the existing file - it works for all Canadian CD projects.

**If you need different boundaries:**
- Get them from Statistics Canada or your data source
- Convert to GeoJSON if needed
- Replace `static/data/census_divisions.geojson`
- Note the property names (e.g., `CDUID`, `CDNAME`, `PRUID`)

### B. Create Your Primary Metrics CSV

**Goal:** Create `static/data/cd_metrics.csv` with this structure:

```csv
GeoUID,Province,Region_Name,[your metric columns...]
3521,35,Ottawa,78.5,95000,1017449
2466,24,Montreal,72.3,88000,2030000
```

**Required columns:**
- `GeoUID` - Census Division ID (must match GeoJSON)
- `Province` - Two-digit province code
- `Region_Name` - Display name
- **Your metric columns** - As many as you need

**Transformation example (Python):**

```python
import pandas as pd

# Load your source data
df = pd.read_csv('raw/your_data.csv')

# Rename and select columns
df_metrics = df.rename(columns={
    'CD_ID': 'GeoUID',
    'Prov': 'Province',
    'Name': 'Region_Name',
    'Innovation': 'Innovation_Score',
    'GDP': 'GDP_Per_Capita',
    'Pop': 'Population'
})[['GeoUID', 'Province', 'Region_Name', 'Innovation_Score', 'GDP_Per_Capita', 'Population']]

# Ensure GeoUID is string
df_metrics['GeoUID'] = df_metrics['GeoUID'].astype(str)

# Handle missing values
df_metrics = df_metrics.fillna(0)

# Export
df_metrics.to_csv('static/data/cd_metrics.csv', index=False)
```

**Replace the file:**
```bash
cp your_metrics.csv static/data/cd_metrics.csv
```

### C. Create Supplementary CSV (Optional)

If you want filter-aware detail panels showing breakdowns:

**Goal:** Create `static/data/cd_supplementary.csv`

```csv
GeoUID,metric_id,rank,industry,value,label
3521,innovation,1,Technology,45.2,Technology Sector
3521,innovation,2,Healthcare,23.1,Healthcare Sector
3521,gdp,1,Finance,67.8,Financial Services
2466,innovation,1,Aerospace,38.9,Aerospace Industry
```

**Required columns:**
- `GeoUID` - Region ID (joins with metrics)
- `metric_id` - Which metric this relates to (optional, for filtering)
- **Display columns** - Whatever you want to show (industry, category, etc.)

**Common patterns:**
- Top N industries per metric
- Category breakdowns
- Time series data
- Comparison data

### D. Add Province Names

The template includes a helper in `src/lib/mapConfig.js`:

```javascript
export const provinceNames = {
  '10': 'Newfoundland and Labrador',
  '35': 'Ontario',
  '24': 'Quebec',
  // ... all 13 provinces/territories
};
```

This is used to convert province codes to names. **You don't need to change this** unless you have custom regions.

---

## Step 4: Configure mapConfig.js (20 min)

Edit: `src/lib/mapConfig.js`

This is the ONLY file you need to edit for most customizations.

### A. Project Metadata

```javascript
export const mapConfig = {
  project: {
    title: 'Your Project Title',
    subtitle: 'Brief description',
  },
```

### B. Data Source Paths

```javascript
  data: {
    geometry: 'data/census_divisions.geojson',
    metrics: 'data/cd_metrics.csv',
    supplementary: 'data/cd_supplementary.csv'  // null if not using
  },
```

### C. Field Mapping

**Match the column names in your CSV and GeoJSON:**

```javascript
  fields: {
    geometry: {
      idField: 'CDUID',      // Property in GeoJSON
      nameField: 'CDNAME',   // Property in GeoJSON
      provinceField: 'PRUID' // Property in GeoJSON
    },
    metrics: {
      idField: 'GeoUID',     // Column in your metrics CSV
      provinceField: 'Province'  // Column in your metrics CSV
    }
  },
```

**Critical:** The VALUES in your CSV's `GeoUID` column must match the VALUES in the GeoJSON's `CDUID` property.

Example: If GeoJSON has `"CDUID": "3521"`, your CSV must have `GeoUID` = `"3521"` (as string or number).

### D. Define Metrics

For each metric to visualize:

**Continuous (Numeric) Example:**

```javascript
  metrics: [
    {
      id: 'innovation',           // Unique ID
      column: 'Innovation_Score', // Column in CSV
      label: 'Innovation Score',
      description: 'Regional innovation capacity index',
      type: 'continuous',

      scale: {
        colors: [
          [0, '#f7fbff'],
          [25, '#c6dbef'],
          [50, '#6baed6'],
          [75, '#2171b5'],
          [100, '#08306b']
        ],
        legendLabels: [
          { min: 75, label: 'Very High (75+)' },
          { min: 50, max: 75, label: 'High (50-75)' },
          { min: 25, max: 50, label: 'Medium (25-50)' },
          { max: 25, label: 'Low (<25)' }
        ]
      },

      format: (value) => value?.toFixed(1) || 'N/A',

      tooltip: {
        fields: ['Region_Name', 'Innovation_Score'],
        format: {
          Innovation_Score: (val) => val?.toFixed(1)
        }
      }
    },

    // Add more metrics here...
  ],

  defaultMetric: 'innovation',
```

**Categorical Example:**

```javascript
    {
      id: 'risk_category',
      column: 'Risk_Level',
      label: 'Risk Level',
      type: 'categorical',

      scale: {
        categories: {
          'Very High': '#d73027',
          'High': '#fc8d59',
          'Medium': '#fee08b',
          'Low': '#91cf60',
          'Very Low': '#1a9850'
        }
      },

      format: (value) => value || 'Unknown',

      tooltip: {
        fields: ['Region_Name', 'Risk_Level'],
        format: {}
      }
    }
```

### E. Configure Two-Row Layout

For the classic two-row dashboard layout:

```javascript
  layout: {
    row1: {
      // Where to place info card
      infoCardPlacement: 'row2'  // 'row1-sidebar' or 'row2'
    },

    row2: {
      enabled: true,  // Show row 2

      components: {
        infoCard: {
          width: 1,      // Width ratio
          align: 'start', // 'start', 'center', 'end'
          order: 0       // First
        },
        barChart: {
          width: 1,
          order: 1       // Second
        },
        scatterChart: {
          width: 1,
          order: 2       // Third
        }
      }
    }
  },
```

**Width ratios:**
- `{infoCard: 1, barChart: 1, scatter: 1}` = Equal thirds (33% each)
- `{infoCard: 2, barChart: 1}` = Info 67%, Bar 33%
- `{infoCard: 1, barChart: 2, scatter: 1}` = Info 25%, Bar 50%, Scatter 25%

### F. Configure Detail Panels

**For simple fields from primary metrics:**

```javascript
  detailPanels: [
    {
      id: 'basic_info',
      title: 'Selected Region',
      type: 'fields',
      fields: [
        { key: 'Innovation_Score', label: 'Innovation Score' },
        { key: 'GDP_Per_Capita', label: 'GDP per Capita', prefix: '$' },
        { key: 'Population', label: 'Population' }
      ],
      format: (value, field) => {
        if (value == null) return 'N/A';
        const prefix = field.prefix || '';
        const suffix = field.suffix || '';
        if (typeof value === 'number') {
          return `${prefix}${value.toLocaleString()}${suffix}`;
        }
        return `${prefix}${value}${suffix}`;
      }
    }
  ],
```

**For supplementary data (filter-aware):**

```javascript
  detailPanels: [
    // ... basic panel above ...

    {
      id: 'top_industries',
      title: 'Top Contributing Industries',
      type: 'custom',
      filterBy: ['metric'],  // Show different data per metric
      template: 'list'       // or 'table'
    }
  ],
```

This will show data from your supplementary CSV, filtered by:
- Current region (automatically)
- Current metric (if `metric_id` column matches)

### G. Configure Charts

```javascript
  charts: {
    barChart: {
      enabled: true,
      title: 'by Province',
      groupBy: 'Province_Name',
      aggregateColumn: 'Innovation_Score',  // Column to aggregate
      aggregateFunction: 'sum',  // 'sum', 'mean', 'median', 'count'
      orientation: 'horizontal',
      xLabel: 'Total Innovation Score →',
      sort: 'descending',
      height: 300,
      linkedHighlight: true  // Hover highlights map regions
    },

    scatterChart: {
      enabled: true,
      title: 'Innovation vs GDP',
      xColumn: 'GDP_Per_Capita',
      yColumn: 'Innovation_Score',
      xScale: 'log',      // 'linear' or 'log'
      yScale: 'linear',
      xLabel: 'GDP per Capita →',
      yLabel: '↑ Innovation Score',
      height: 300,
      linkedHighlight: true,
      showTooltip: true
    }
  }
};
```

---

## Step 5: Update Server Data Loader (If Using Supplementary Data)

If you're using supplementary data, update `src/routes/+page.server.js`:

### Current (loads only metrics):

```javascript
export async function load() {
  try {
    const geoData = JSON.parse(readFileSync('static/data/census_divisions.geojson', 'utf-8'));
    const csvContent = readFileSync('static/data/cd_metrics.csv', 'utf-8');
    const metrics = parse(csvContent, { /* ... */ });

    return { geoData, metrics };
  } catch (error) {
    return { geoData: null, metrics: null, error: error.message };
  }
}
```

### Updated (loads supplementary too):

```javascript
export async function load() {
  try {
    const geoData = JSON.parse(readFileSync('static/data/census_divisions.geojson', 'utf-8'));

    // Load primary metrics
    const csvContent = readFileSync('static/data/cd_metrics.csv', 'utf-8');
    const metrics = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.header) return value;
        const num = Number(value);
        return isNaN(num) ? value : num;
      }
    });

    // Load supplementary data (if exists)
    let supplementary = null;
    try {
      const suppContent = readFileSync('static/data/cd_supplementary.csv', 'utf-8');
      supplementary = parse(suppContent, {
        columns: true,
        skip_empty_lines: true,
        cast: (value, context) => {
          if (context.header) return value;
          const num = Number(value);
          return isNaN(num) ? value : num;
        }
      });
    } catch (err) {
      console.log('No supplementary data file found (optional)');
    }

    return { geoData, metrics, supplementary };
  } catch (error) {
    console.error('Error loading data:', error);
    return { geoData: null, metrics: null, supplementary: null, error: error.message };
  }
}
```

### Update MapPage.svelte to load supplementary:

Edit `src/lib/components/MapPage.svelte`:

```javascript
import { geoData, metricsData, supplementaryData } from '$lib/stores/mapStore.js';

onMount(() => {
  if (data.geoData && data.metrics) {
    // Add province names
    data.metrics.forEach((d) => {
      d.Province_Name = provinceNames[String(d.Province)] || 'Unknown';
    });

    geoData.set(data.geoData);
    metricsData.set(data.metrics);

    // Load supplementary if provided
    if (data.supplementary) {
      supplementaryData.set(data.supplementary);
    }
  }
});
```

---

## Step 6: Test Your Map (10 min)

### Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173

### Visual Checklist

**Data loads correctly:**
- [ ] Map shows colored regions (not all gray)
- [ ] Colors match your data ranges
- [ ] Legend displays with correct labels
- [ ] No console errors (F12)

**Interactions work:**
- [ ] Hover shows tooltip with region name and metric
- [ ] Click selects region (gold border)
- [ ] Detail panel shows correct data from primary metrics
- [ ] Province filter dropdown works
- [ ] Charts appear in bottom row (if enabled)

**Supplementary data works (if applicable):**
- [ ] Select a region
- [ ] Custom panel shows supplementary data list/table
- [ ] Switching metrics updates the supplementary data shown

**Layout looks right:**
- [ ] Row 1: Map + controls
- [ ] Row 2: Info card + charts (if configured)
- [ ] Width ratios match your config

### Common Issues

**Issue: Map is blank**
- Check browser console for errors
- Verify file paths in `data` config
- Ensure GeoJSON file exists

**Issue: Regions are gray**
- Check `column` name matches your CSV
- Verify `idField` values match between CSV and GeoJSON
- Ensure values are same type (both strings or both numbers)

**Issue: Join failed (data not showing)**
```javascript
// In browser console (F12):
console.log($metricsData[0]);  // Check first metric row
console.log($geoData.features[0].properties);  // Check first geometry
```
Compare ID values - they must match exactly!

**Issue: Supplementary panel empty**
- Check if `cd_supplementary.csv` exists
- Verify `GeoUID` column matches selected region
- Check `metric_id` column matches current metric (if filtering by metric)

### Use Testing Checklist

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for comprehensive testing.

---

## Step 7: Customize and Polish (Optional)

### Multiple Metrics

Enable metric switcher:

```javascript
features: {
  metricSwitcher: {
    enabled: true,
    style: 'dropdown'  // or 'tabs'
  }
}
```

Users can now switch between your defined metrics.

### Region Groups

The template includes Southern Quebec/Ontario filters. Enable in config:

```javascript
mapConfig.regionGroups = {
  enabled: true,
  groups: regionGroups  // Already defined in mapConfig.js
};
```

### Layout Modes

**Two-Column Mode** (dashboard style):

```javascript
layout: {
  mode: 'two-column',  // Map full height, components stacked right
}
```

**Sidebar Mode** (default):

```javascript
layout: {
  mode: 'sidebar',  // Map + sidebar (Row 1), optional Row 2
}
```

### Color Schemes

Use ColorBrewer: https://colorbrewer2.org/

Pick a scheme and update your metric's `scale.colors`.

---

## Step 8: Deploy to Production

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Deploy Options

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `build`

**WordPress iframe:**
1. Deploy to Vercel/Netlify
2. Embed with iframe:
```html
<iframe src="https://your-map.vercel.app"
        width="100%"
        height="800"
        frameborder="0">
</iframe>
```

---

## Template Checklist

Before going live:

**Data:**
- [ ] Primary metrics CSV created and loaded
- [ ] Supplementary CSV created (if needed)
- [ ] GeoJSON boundaries verified
- [ ] All IDs match between files

**Configuration:**
- [ ] Project title and subtitle set
- [ ] Field mapping matches actual column names
- [ ] All metrics defined with correct columns
- [ ] Color scales appropriate for data range
- [ ] Layout configured (row1/row2 placement)
- [ ] Detail panels configured
- [ ] Charts enabled and configured

**Code Updates:**
- [ ] Server loader updated (if using supplementary data)
- [ ] MapPage updated to load supplementary (if applicable)

**Testing:**
- [ ] Tested locally with `npm run dev`
- [ ] No console errors
- [ ] All interactions work
- [ ] Supplementary data displays correctly
- [ ] Tested on mobile

---

## Understanding the Two-Dataset Architecture

### Why Two Datasets?

**Pattern:**
```
Primary Metrics (1 row per CD)
    ↓ Visualized on map
    ↓ Used for charts

Supplementary Data (N rows per CD)
    ↓ Shows in detail panels
    ↓ Filter-aware (by metric)
    ↓ Provides context
```

**Example: Innovation Map**

**What users see on map:** Innovation score (0-100)
**What users see in detail panel when they click a region:**
- Innovation Score: 78.5 (from primary metrics)
- Top 5 contributing industries (from supplementary data)
- GDP per capita: $95,000 (from primary metrics)

**Why separate files:**
- Primary metrics = one-to-one with map polygons
- Supplementary = one-to-many with regions (breakdowns, top N lists)
- Cleaner data management
- Easier to update specific parts

### Supplementary Data Schema

```csv
GeoUID,metric_id,rank,industry,value
3521,innovation,1,Technology,45.2
3521,innovation,2,Healthcare,23.1
3521,innovation,3,Manufacturing,18.7
3521,gdp,1,Finance,67.8
3521,gdp,2,Real Estate,45.3
```

**Columns:**
- `GeoUID` - Joins to region
- `metric_id` - Filters by active metric (optional)
- `rank` - Display order
- `industry` (or category, sector, etc.) - What to display
- `value` - Numeric contribution (optional)

**How it works:**
1. User selects Ottawa (3521)
2. User viewing "innovation" metric
3. Store filters supplementary to: `GeoUID = 3521 AND metric_id = 'innovation'`
4. Detail panel shows top 3 industries for innovation
5. User switches to "gdp" metric
6. Panel updates to show top industries for GDP

---

## AI Agent Instructions

If you're an AI helping set up this template:

1. **Understand the data architecture first:**
   - Ask about primary metrics vs. supplementary data
   - Clarify if they need filter-aware detail panels
   - Understand their metric types (continuous/categorical)

2. **Help with data transformation:**
   - Generate Python/R scripts for their specific data
   - Ensure ID matching between datasets
   - Create supplementary CSV if they have breakdown data

3. **Configure completely:**
   - Set all field mappings to actual column names
   - Create metric definitions with appropriate color scales
   - Configure layout based on their component preferences

4. **Update code if needed:**
   - Add supplementary data loading to server if they need it
   - Update MapPage to load supplementary data

5. **Test incrementally:**
   - Primary metrics first
   - Then supplementary data
   - Then layout customization

---

## Common Patterns

### Pattern 1: Single Metric, Simple Info Card

```javascript
// mapConfig.js
metrics: [{ id: 'pop', column: 'Population', type: 'continuous', /* ... */ }],
layout: { row1: { infoCardPlacement: 'row1-sidebar' } },
data: { supplementary: null },
charts: { barChart: { enabled: false }, scatterChart: { enabled: false } }
```

### Pattern 2: Multiple Metrics, Filter-Aware Panels

```javascript
metrics: [
  { id: 'innovation', /* ... */ },
  { id: 'gdp', /* ... */ },
  { id: 'employment', /* ... */ }
],
layout: { row1: { infoCardPlacement: 'row2' } },
data: { supplementary: 'data/cd_supplementary.csv' },
detailPanels: [
  { type: 'fields', /* ... */ },
  { type: 'custom', filterBy: ['metric'], template: 'list' }
],
charts: { barChart: { enabled: true }, scatterChart: { enabled: true } }
```

### Pattern 3: Dashboard with Tables

```javascript
layout: {
  mode: 'two-column',  // Full-height map, stacked right
  row2: { components: { /* ... */ } }
},
detailPanels: [
  { type: 'custom', template: 'table' }  // Tabular supplementary data
]
```

---

## Getting Help

- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - Complete config reference
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Testing guide
- [LAYOUT_SPECIFICATION.md](LAYOUT_SPECIFICATION.md) - Layout options
- [src/lib/DATA_SCHEMA.md](src/lib/DATA_SCHEMA.md) - Data format details

---

**Last Updated:** 2025-12-11
**Template Version:** SvelteKit 2.0 + MapLibre 5.14
