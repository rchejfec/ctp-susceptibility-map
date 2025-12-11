# Layout Specification

## Overview

This document defines the layout architecture for the SvelteKit map visualization framework. The layout is responsive, configurable, and optimized for desktop viewing with graceful degradation to mobile.

**Current Status**: The layout system supports manual placement configuration for components with two layout modes (Sidebar and Two-Column).

---

## Layout Modes

The framework supports two layout modes:

### Mode 1: Sidebar (Default)
Traditional dashboard with map on left, controls/info on right sidebar, and optional charts below.

### Mode 2: Two-Column
Map takes full height on left, all components stack vertically on right (scrollable).

---

## Sidebar Mode Layout

### Row 1 (Top Row) - Always Present

**Required Components:**
- **Map** (left side, with legend overlay)
- **Controls Card** (right sidebar)

**Optional Component:**
- **Info Card** - Can be placed in:
  - Row 1 sidebar (via `infoCardPlacement: 'row1-sidebar'`)
  - Row 2 (via `infoCardPlacement: 'row2'`)

**Layout Examples:**

**Option A: Map + Controls only**
```
┌────────────────────────────┬─────────────────┐
│                            │                 │
│   Map                      │  Controls       │
│   (legend overlay)         │  Card           │
│                            │                 │
└────────────────────────────┴─────────────────┘
```

**Option B: Map + Controls + Info Card**
```
┌────────────────────────────┬─────────────────┐
│                            │  Controls       │
│   Map                      │  Card           │
│   (legend overlay)         ├─────────────────┤
│                            │  Info Card      │
└────────────────────────────┴─────────────────┘
```

### Row 2 (Bottom Row) - Optional

**Appears When:**
- Charts are enabled, OR
- Info Card is configured for Row 2, OR
- Other components are configured

**Supported Components:**
- Info Card (if configured for Row 2)
- Bar Chart
- Scatter Plot
- Additional custom components

**Width Configuration:**
Components can have custom width ratios via `layout.row2.components`:
```javascript
components: {
  barChart: { width: 2 },     // 2 units
  scatterChart: { width: 1 }  // 1 unit (creates 2fr 1fr grid)
}
```

---

## Two-Column Mode Layout

Full-height map on left, all components stacked on right.

```
┌────────────────────────────┬─────────────────┐
│                            │  Controls       │
│                            ├─────────────────┤
│   Map (Full Height)        │  Info Card      │
│   (legend overlay)         ├─────────────────┤
│                            │  Chart 1        │
│                            ├─────────────────┤
│                            │  Chart 2        │
│                            │  (scrollable)   │
└────────────────────────────┴─────────────────┘
```

**Right column scrolls** if content exceeds viewport height.

---

## Configuration Structure

### Layout Configuration

```javascript
layout: {
  mode: 'sidebar',  // 'sidebar' or 'two-column'

  row1: {
    infoCardPlacement: 'row1-sidebar'  // 'row1-sidebar' or 'row2'
  },

  row2: {
    enabled: 'auto',  // 'auto' (show if components enabled), true, or false
    components: {
      infoCard: {
        width: 1,
        order: 0,
        align: 'center',     // 'start', 'center', 'end'
        maxWidth: '50%'      // CSS value
      },
      barChart: {
        width: 2,
        order: 1
      },
      scatterChart: {
        width: 1,
        order: 2
      }
    }
  }
}
```

### Feature Toggles

```javascript
features: {
  metricSwitcher: { enabled: true },
  searchBar: { enabled: true },
  provinceFilter: { enabled: true },
  legend: { enabled: true },
  infoCard: { enabled: true }
}
```

### Chart Configuration

```javascript
charts: {
  barChart: {
    enabled: true,
    // ... chart-specific config
  },
  scatterChart: {
    enabled: false,
    // ... chart-specific config
  }
}
```

---

## Component Specifications

### Map Component
- **Position**: Always in Row 1 left (sidebar mode) or left column (two-column mode)
- **Height**: Taller than other components
- **Contains**: MapLibre GL canvas with overlaid legend

### Controls Card
- **Position**: Row 1 right sidebar or top of right column
- **Width**: 320px fixed (desktop)
- **Contains**: Search bar, metric switcher, province filter

### Info Card (Detail Panel)
- **Placement**: Configurable via `infoCardPlacement`
- **Purpose**: Show selected region details
- **Placeholder**: "Select a region" when nothing selected

### Chart Components
- **Position**: Row 2 (sidebar mode) or stacked in right column (two-column mode)
- **Types**: Bar charts, scatter plots
- **Width**: Configurable via layout config

---

## Responsive Behavior (< 1200px)

All modes stack vertically on mobile:

```
┌──────────────────────────┐
│  Map Section             │
│  (65vh min height)       │
└──────────────────────────┘
┌──────────────────────────┐
│  Controls Card           │
└──────────────────────────┘
┌──────────────────────────┐
│  Info Card               │
└──────────────────────────┘
┌──────────────────────────┐
│  Charts (if enabled)     │
└──────────────────────────┘
```

---

## Implementation Status

### ✅ Implemented
- Two layout modes (Sidebar and Two-Column)
- Map + Controls in Row 1
- Manual placement configuration for Info Card
- Configurable Row 2 width ratios
- Component ordering via `order` property
- Legend overlay on map
- Responsive mobile layout
- All controls grouped in one card

### ⏳ Future Enhancements (Not Currently Implemented)
- **Table component**: With scrolling exception
- **Multiple info cards**: Support for more than one info card type

---

## Usage Examples

### Example 1: Sidebar with Info in Row 1

```javascript
export const mapConfig = {
  layout: {
    mode: 'sidebar',
    row1: {
      infoCardPlacement: 'row1-sidebar'
    }
  },
  charts: {
    barChart: { enabled: true }
  }
}
```

### Example 2: Sidebar with Info in Row 2

```javascript
export const mapConfig = {
  layout: {
    mode: 'sidebar',
    row1: {
      infoCardPlacement: 'row2'
    },
    row2: {
      components: {
        infoCard: { width: 1, order: 0, align: 'center', maxWidth: '50%' },
        barChart: { width: 2, order: 1 }
      }
    }
  },
  charts: {
    barChart: { enabled: true }
  }
}
```

### Example 3: Two-Column Mode

```javascript
export const mapConfig = {
  layout: {
    mode: 'two-column'
  },
  charts: {
    barChart: { enabled: true },
    scatterChart: { enabled: true }
  }
}
```

---

## Design Rationale

### Manual Placement (By Design)

**Implementation**: Manual placement via configuration is the intended design
- Developer explicitly sets `infoCardPlacement` to 'row1-sidebar' or 'row2'
- No automatic height detection or overflow-based repositioning
- Predictable layouts with no unexpected shifts
- Simple to reason about and maintain
- Users have explicit control over component placement

### Two Layout Modes

- **Sidebar Mode**: Best for 0-2 charts, traditional dashboard feel
- **Two-Column Mode**: Best for 3+ components, full-height map emphasis

### Configurable Width Ratios

Different visualizations need different proportions:
- Large chart + small info card: `{ barChart: { width: 2 }, infoCard: { width: 1 } }`
- Equal distribution: `{ chart1: { width: 1 }, chart2: { width: 1 } }`

---

*Last Updated: 2025-12-11*
*Version: 2.0 (SvelteKit Implementation)*
