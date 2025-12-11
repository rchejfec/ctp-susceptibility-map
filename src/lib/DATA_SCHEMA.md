# Data Schema Documentation

This document defines the expected data structure for the mapping framework. Your project-specific data transformation scripts should produce data matching this schema.

## Overview

The framework expects **three types of data**:
1. **Geometry Data** (GeoJSON) - Geographic boundaries
2. **Metrics Data** (CSV/JSON) - Primary metrics for visualization
3. **Supplementary Data** (CSV/JSON, optional) - Additional context data

---

## 1. Geometry Data (GeoJSON)

**File:** `static/data/{project}_geometry.geojson`

Standard GeoJSON format with features containing polygon/multipolygon geometries.

### Required Structure:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "unique_identifier",
        "name": "Display Name",
        "province_code": "XX"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

### Required Properties:
- **`id`**: Unique identifier (joins with metrics data)
- **`name`**: Human-readable name for display
- **`province_code`**: Province/territory identifier (for filtering)

### Notes:
- Property keys should match `mapConfig.geometry.idField`, `nameField`, `provinceField`
- Can include additional properties (population, area, etc.)
- Framework is agnostic to actual field names - just configure them in mapConfig

---

## 2. Metrics Data (Primary)

**File:** `static/data/{project}_metrics.csv`

Contains the metrics you want to visualize on the map.

### Structure for Single Metric Projects:
```csv
id,metric_value,category,province_code,label
3521,45.2,High,35,Ottawa
3522,32.1,Medium,35,Kingston
```

### Structure for Multi-Metric Projects:
```csv
id,metric_1,metric_2,metric_3,metric_4,province_code,label
3521,45.2,67.8,23.4,89.1,35,Ottawa
3522,32.1,54.3,45.6,71.2,35,Kingston
```

### Required Columns:
- **`id`**: Must match geometry `id` field (join key)
- **One or more metric columns**: Numeric or categorical values
- **`province_code`**: For province filtering (optional but recommended)
- **`label`**: Display name (can duplicate geometry name or differ)

### Optional Columns:
- Any additional fields you want in tooltips/detail panels
- Fields for chart axes (population, income, etc.)
- Grouping fields (industry, sector, etc.)

### Data Types:
- **Numeric metrics**: Will be visualized with continuous color scales
- **Categorical metrics**: Will be visualized with discrete color categories
- **Text fields**: Available for display only

---

## 3. Supplementary Data (Optional)

**File:** `static/data/{project}_supplementary.csv`

Additional context data that's filter-aware or region-specific.

### Example: Top Industries by Region and Metric
```csv
id,metric_id,rank,industry,value
3521,metric_1,1,Manufacturing,12.5
3521,metric_1,2,Healthcare,8.3
3521,metric_2,1,Technology,45.2
3522,metric_1,1,Agriculture,15.7
```

### Structure:
- **`id`**: Region identifier (joins with metrics)
- **Filter fields**: `metric_id`, `category`, etc. (whatever you need to filter by)
- **Display fields**: Data to show in supplementary panels

### Use Cases:
- Top N contributors to a metric
- Breakdown by category
- Time series data
- Comparison data

---

## Configuration Mapping

### In `mapConfig.js`:
```javascript
export const mapConfig = {
  // Data source files
  data: {
    geometry: 'data/project_geometry.geojson',
    metrics: 'data/project_metrics.csv',
    supplementary: 'data/project_supplementary.csv' // optional
  },

  // Field mapping - tell framework which columns to use
  fields: {
    // Geometry fields
    geometry: {
      idField: 'id',          // Join key in GeoJSON properties
      nameField: 'name',      // Display name
      provinceField: 'province_code'  // Province identifier
    },

    // Metrics fields
    metrics: {
      idField: 'id',          // Join key in metrics CSV
      provinceField: 'province_code'  // Province identifier (for filtering)
    }
  },

  // Metrics definitions
  metrics: [
    {
      id: 'metric_1',
      column: 'metric_value',  // Column name in CSV
      label: 'Innovation Score',
      type: 'continuous',
      // ... color scales, legend config, etc.
    }
  ]
};
```

---

## Data Transformation Workflow

### Your Responsibility (Per Project):
1. **Extract** raw data from source (database, API, files)
2. **Transform** to match schema (Python/R/Node script)
3. **Validate** required fields exist
4. **Export** to `static/data/` with consistent naming

### Framework's Responsibility:
1. **Load** data files specified in config
2. **Join** geometry + metrics on configured ID fields
3. **Render** visualizations based on config
4. **Handle** interactions (filtering, selection, etc.)

---

## Example Transformation Script (Pseudocode)

```python
import pandas as pd
import geopandas as gpd

# Load raw data
raw_metrics = pd.read_csv('raw/source_data.csv')
raw_geometry = gpd.read_file('raw/boundaries.shp')

# Transform metrics
metrics = raw_metrics.rename(columns={
    'region_code': 'id',
    'score': 'metric_value',
    'prov': 'province_code'
})

# Ensure required columns
assert 'id' in metrics.columns
assert 'metric_value' in metrics.columns
assert 'province_code' in metrics.columns

# Export
metrics.to_csv('static/data/project_metrics.csv', index=False)

# Transform geometry
geometry = raw_geometry.rename(columns={
    'CD_UID': 'id',
    'CD_NAME': 'name',
    'PR': 'province_code'
})

geometry.to_file('static/data/project_geometry.geojson', driver='GeoJSON')
```

---

## Validation Checklist

Before deploying a new project, verify:

- [ ] Geometry and metrics have matching ID values
- [ ] All required fields exist with correct names
- [ ] Numeric fields are actually numeric (not strings)
- [ ] Province codes are consistent across files
- [ ] No missing/null values in critical fields
- [ ] Field names match those configured in `mapConfig.js`
- [ ] File paths in config match actual file locations

---

## Notes

- **Schema is flexible**: The framework doesn't care what your fields are called, just configure the mapping
- **No hardcoded assumptions**: No references to "CTP", "industries", "census divisions" in framework code
- **Type inference**: CSV parser will auto-detect numbers vs strings
- **Multiple metrics**: Single CSV can have many metric columns, just define each in config
- **Supplementary data is optional**: Only needed for complex detail panels

---

## Questions?

If your data doesn't fit this schema, consider:
1. Can you transform it to match?
2. Do you need a new data type? (Time series, networks, etc.)
3. Is there a config option that would make your data work?

The schema is designed to be generic but extensible. If you have a legitimate use case that doesn't fit, we can extend it.
