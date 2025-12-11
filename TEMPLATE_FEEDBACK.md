# pb_map_base Template - Implementation Feedback

**Project**: CTP Census Division Susceptibility Map
**Date**: December 11, 2025
**Template Version**: pb_map_base (test implementation)

## Executive Summary

Successfully implemented a 2-row complex layout map with 4 categorical metrics, NAICS sector details, stacked bar chart, and scatter plot. The template's configuration-driven approach worked well overall, but revealed several areas where the template needed fixes or enhancements.

**Overall Assessment**: ✅ Template is functional and powerful, but has some rough edges that needed smoothing.

---

## What Worked Well

### ✅ 1. Configuration-Driven Design
- **mapConfig.js** as single source of truth was excellent
- Easy to understand structure: data paths → fields → metrics → layout → charts
- Changes to config immediately reflected in UI via hot reload
- Minimal need to touch component code

### ✅ 2. Layout System
- 2-row layout configuration worked as expected
- `infoCardPlacement: 'row1-sidebar'` correctly placed controls + info card in sidebar
- Row 2 component width ratios (`width: 1` for equal distribution) were intuitive
- Component ordering via `order` property worked perfectly

### ✅ 3. Data Processing Pipeline
- Clear separation: raw data → processed CSVs → template consumption
- Python scripts for data transformation kept logic separate from visualization
- CSV format was straightforward to generate and debug

### ✅ 4. Metric Switching
- Metric definitions with `id`, `column`, `label`, `type`, `scale` were comprehensive
- Switching between metrics updated map, legend, charts, and tooltips correctly
- Support for both categorical and continuous metrics (though we only used categorical)

### ✅ 5. Hot Module Replacement
- Vite HMR worked flawlessly throughout development
- Config changes reflected immediately without full page reload
- Made iterative development very fast

---

## Issues Found & Fixes Required

### ❌ 1. Categorical Scale Data Structure Mismatch

**Problem**: Template components expected `scale.categories` to be an object like `{0: '#color', 1: '#color'}`, but our config (logically) used:
```javascript
scale: {
    categories: [0, 1, 2, 3, 4, 5],  // Array
    colors: {0: '#E0E0E0', 1: '#B3CDE3', ...},  // Object
    labels: {0: 'No susceptibility', ...}  // Object
}
```

**Components Affected**:
- `MapView.svelte` - Line 227: `Object.entries(metricConfig.scale.categories)`
- `Legend.svelte` - Line 38: `Object.entries(categories)`

**Fix Applied**:
- Modified both components to iterate over `categories` array and look up values in `colors`/`labels` objects
- `MapView.svelte:225-232`: Changed to `metricConfig.scale.categories.forEach((category) => {...})`
- `Legend.svelte:41-46`: Changed to `[...categories].reverse().map((category) => ({...}))`

**Template Improvement Needed**: Document the expected categorical scale structure, or make components handle both formats.

---

### ❌ 2. Supplementary Data Field Configuration Missing

**Problem**: `mapStore.js` hardcoded `d.id` and `d.metric_id` for supplementary data filtering, but our data had `GeoUID` and `Metric` columns.

**Error**: DetailPanel2 showed "No sector data available" because filter never matched.

**Fix Applied**:
- Added to `mapConfig.js`:
  ```javascript
  fields: {
      supplementary: {
          idField: 'GeoUID',
          metricField: 'Metric'
      }
  }
  ```
- Modified `mapStore.js:119-129` to use configured field names:
  ```javascript
  const idField = mapConfig.fields?.supplementary?.idField || 'GeoUID';
  return $supplementaryData.filter((d) => String(d[idField]) === String($selectedRegion));
  ```

**Template Improvement Needed**: Add supplementary field configuration to template and update mapStore to use it consistently.

---

### ❌ 3. DetailPanel Shows All Panels

**Problem**: `DetailPanel.svelte` iterated through ALL panels in `detailPanels` array, showing both the basic info card AND the NAICS table in the sidebar.

**Expected Behavior**: DetailPanel (sidebar) should show only the first panel, DetailPanel2 (Row 2) should show the second panel.

**Fix Applied**:
- Modified `DetailPanel.svelte:17-19`:
  ```javascript
  // Only show the first panel (basic info card for sidebar)
  // DetailPanel2 handles the second panel (NAICS table in Row 2)
  const panels = mapConfig.detailPanels ? [mapConfig.detailPanels[0]] : [];
  ```

**Template Improvement Needed**: Document panel assignment convention, or add explicit panel IDs to config to indicate which component uses which panel.

---

### ❌ 4. No Built-in Stacked Bar Chart Support

**Problem**: Template had basic bar chart, but our requirement was stacked bars showing share by category.

**What Was Needed**:
- Custom aggregation function: `share_by_category`
- Stacked segment rendering with category-specific colors
- Share calculation: (Labour force in CDs with score X) / (Total PT labour force)

**Fix Applied**: Extended `BarChart.svelte` with ~150 lines of new code:
- `getScoreField()` - Maps metric IDs to data columns
- `aggregateDataStacked()` - Calculates share by province and category
- `renderStackedBars()` - Renders stacked segments with category colors
- `handleStackedMouseOver()` - Linked highlighting for stacked bars

**Template Improvement Needed**: Consider adding stacked bar chart as a built-in chart type with config-driven stacking dimension and color mapping.

---

### ❌ 5. Scatter Chart Y-Axis Not Dynamic

**Problem**: Scatter chart had fixed `yColumn` in config. We needed Y-axis to change based on selected metric (IS_score, MS_score, FS_score, Top_Score_Normalized).

**Fix Applied**:
- Added `scatterYColumn` to each metric definition
- Modified `ScatterPlot.svelte:60`:
  ```javascript
  const yColumn = metricConfig.scatterYColumn || chartConfig.yColumn;
  ```

**Template Improvement Needed**: Document the `scatterYColumn` pattern, or make it a built-in feature with fallback to default.

---

### ⚠️ 6. Navigation Tabs in Layout

**Problem**: Template's `+layout.svelte` included navigation tabs ("Default (1 Row)", "2-Column", "2-Row Complex") suitable for testing but not for production/iframe embedding.

**Fix Applied**: Removed navigation completely from `+layout.svelte`, leaving only the slot wrapper.

**Template Improvement Needed**:
- Provide separate layouts: `+layout.test.svelte` (with nav) and `+layout.prod.svelte` (without nav)
- OR: Add config option `showNavigation: false` to hide nav bar

---

### ⚠️ 7. Default Metric Order vs Dropdown Order

**Issue**: `defaultMetric` config controlled which metric loaded on page load, but dropdown order was determined by array position in `metrics[]`.

**Our Need**: Top Score as both default AND first in dropdown.

**Fix Applied**: Reordered metrics array to put Top Score first.

**Template Improvement Needed**: Either:
- Document that dropdown order = array order
- OR: Add explicit `dropdownOrder` config to decouple display order from array order

---

## Component Customization Experience

### DetailPanel2 (NAICS Sector Table)

**Task**: Display metric-filtered NAICS sector breakdown in Row 2.

**Approach**: Complete rewrite of `DetailPanel2.svelte` (~250 lines).

**What Worked**:
- Access to `selectedRegionSupplementary` store
- Access to `selectedMetric` store for filtering
- Svelte reactivity made filtering logic clean

**Challenges**:
- Had to create 45+ NAICS code lookup dictionary manually
- No clear pattern for "show nothing for certain metrics" (e.g., Top Score)
- Store filtering issue (documented above) caused initial confusion

**Template Improvement Needed**: Provide examples of supplementary data filtering patterns.

---

## Data Processing Experience

### Python Scripts

Created two scripts:
1. `prepare_cd_metrics.py` - Transform primary metrics CSV
2. `prepare_cd_supplementary.py` - Transform NAICS data to long format

**Challenges Encountered**:
- **Column name whitespace**: Raw CSV had "Labour force (2021) " with trailing space → Fixed with `df.columns.str.strip()`
- **NAICS alphanumeric codes**: Values like "2211FF" → Created `clean_naics()` to handle
- **Score normalization**: FS_score max was 1.285 (should be ≤1.0) → Added normalization loop
- **Unicode in console**: Windows console couldn't render ✓ checkmark → Changed to `[OK]`

**What Worked Well**:
- `uv` package manager was fast and reliable
- Pandas made transformations straightforward
- Iterative testing with `uv run python scripts/...` was smooth

**Template Improvement Needed**: Provide data processing template scripts with common patterns (normalization, wide→long, column cleaning).

---

## Configuration Complexity

### mapConfig.js Final Size: 539 lines

**Breakdown**:
- Fields mapping: ~15 lines
- Metrics (4 × ~50 lines): ~200 lines
- Layout: ~20 lines
- Detail panels: ~30 lines
- Charts (bar + scatter): ~80 lines
- Province names + viewport: ~40 lines
- Style overrides: ~20 lines
- Remaining: comments, formatting

**Assessment**: Configuration was verbose but readable. The structure made sense once understood.

**Template Improvement Needed**:
- Provide config validation (check for required fields, warn about typos)
- Add TypeScript types for config object
- Consider schema-based config with IntelliSense support

---

## Testing & Debugging

### What Helped:
- ✅ Browser console errors were clear (e.g., "Expected color but found number")
- ✅ Vite server output showed which files were updating
- ✅ CSV files easy to inspect with `head`, `grep`, `cut` commands
- ✅ Svelte DevTools (implied, not explicitly used)

### What Was Difficult:
- ❌ No visual indicator when config had errors (silent failures)
- ❌ Hard to debug why charts weren't showing (missing data? config error? component bug?)
- ❌ No sample data set to verify template before adding real data

**Template Improvement Needed**:
- Add config validation with helpful error messages
- Provide sample dataset that exercises all features
- Add "debug mode" that shows data flow (what data reached which component)

---

## Performance Notes

- **Map rendering**: Fast, even with 293 census divisions
- **Hot reload**: < 1 second for most changes
- **Chart rendering**: Smooth, no lag when switching metrics
- **Data loading**: 20MB GeoJSON loaded without issues
- **Bundle size**: Not measured, but dev build was responsive

No performance concerns for this dataset size.

---

## Feature Requests for Template

### High Priority:
1. **Fix categorical scale handling** - Support both object and array formats
2. **Add supplementary data field config** - Don't hardcode field names
3. **Stacked bar chart** - Make it a configurable chart type
4. **Dynamic scatter Y-axis** - Built-in support for metric-specific columns
5. **Config validation** - Warn about missing required fields

### Medium Priority:
6. **Sample data processor scripts** - Common transformation patterns
7. **Panel assignment clarity** - Document which component uses which panel
8. **Production layout** - Remove/hide test navigation
9. **Debug mode** - Visualize data flow and component state

### Low Priority:
10. **TypeScript config types** - IntelliSense for mapConfig
11. **Dropdown order config** - Decouple from array order
12. **Built-in NAICS lookup** - Common sector code dictionaries

---

## Summary Statistics

### Development Time Estimate:
- **Data processing**: 2-3 hours (scripts, debugging, normalization)
- **Config setup**: 1-2 hours (defining metrics, layout, charts)
- **Component fixes**: 3-4 hours (fixing template issues, extending BarChart)
- **Testing & debugging**: 2-3 hours (iterative fixes)
- **Total**: ~10-12 hours for a developer familiar with Svelte

### Lines of Code Modified:
- **mapConfig.js**: 539 lines (new)
- **DetailPanel2.svelte**: 250 lines (complete rewrite)
- **BarChart.svelte**: +150 lines (stacked bar extension)
- **ScatterPlot.svelte**: 1 line (dynamic Y-axis)
- **MapView.svelte**: ~20 lines (categorical scale fix)
- **Legend.svelte**: ~15 lines (categorical scale fix)
- **DetailPanel.svelte**: ~5 lines (panel filtering)
- **mapStore.js**: ~15 lines (supplementary data fix)
- **+layout.svelte**: -90 lines (remove nav)
- **+page.svelte**: ~5 lines (config import)

**Total**: ~970 lines modified/added across 10 files

---

## Recommendation

**Would I use this template again?** Yes, with caveats.

**Pros**:
- Saved significant time vs building from scratch
- Clean separation of concerns (data, config, components)
- Extensible architecture made customizations straightforward
- SvelteKit + Vite stack is modern and performant

**Cons**:
- Several bugs needed fixing before it worked
- Sparse documentation (had to read component code to understand behavior)
- Some features required component modification (stacked bars, dynamic axes)
- No validation or helpful error messages

**Best Use Cases**:
- Multi-metric geographic data visualization
- Projects needing linked charts + map interactions
- Teams comfortable with Svelte and willing to debug/extend

**Not Ideal For**:
- Quick prototypes (initial bugs slow you down)
- Non-technical users (requires code changes for customization)
- Projects needing production-ready template out of the box

---

## Template Evolution Suggestions

### Short Term (Fixes):
1. Fix categorical scale handling in MapView and Legend
2. Add supplementary field configuration
3. Fix DetailPanel to only show first panel
4. Add config validation with clear error messages
5. Document common customization patterns

### Medium Term (Enhancements):
1. Add stacked bar chart as built-in type
2. Add TypeScript types for config
3. Create sample data processing scripts
4. Add debug mode with data flow visualization
5. Separate production/test layouts

### Long Term (Architecture):
1. Plugin system for custom chart types
2. Visual config editor (GUI for mapConfig.js)
3. Built-in data validation/transformation helpers
4. Component library documentation site
5. Example projects gallery

---

## Final Thoughts

The pb_map_base template successfully delivered a complex 2-row layout with multiple interactive components. The configuration-driven approach is powerful and makes sense architecturally. However, the template feels like a v0.5 - functional but needing polish.

With the fixes applied during this project, the template is now more robust. Documenting these fixes and incorporating them back into the base template would significantly improve the developer experience for future users.

**Key Takeaway**: Great foundation, needs better documentation and some bug fixes to reach production-ready status.
