# Testing Instructions: ECharts Migration

This branch replaces the D3-based charts with Apache ECharts and introduces a new page to test an ECharts-based map.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Build:**
    ```bash
    npm run build
    ```

## Verification Steps

### 1. Hybrid Dashboard (MapLibre Map + ECharts Figures)
*   **URL:** `/` (Home)
*   **Components:**
    *   **Map:** MapLibre (Vector Tiles/GeoJSON).
    *   **Bar Chart:** Apache ECharts (Row 2 or Sidebar).
    *   **Scatter Plot:** Apache ECharts (Row 2).
*   **Verify:**
    *   Hovering chart elements highlights the map.
    *   Hovering map regions highlights the chart elements.
    *   Chart resizing works correctly.

### 2. Full ECharts Dashboard (ECharts Map + ECharts Figures)
*   **URL:** `/echarts-full`
*   **Components:**
    *   **Map:** Apache ECharts (Geo component).
    *   **Bar Chart:** Apache ECharts.
    *   **Scatter Plot:** Apache ECharts.
*   **Verify:**
    *   **Rendering:** The map should render all census divisions. Colors should match the metrics.
    *   **Interaction:**
        *   Hovering a region highlights it.
        *   Hovering a chart bar highlights the corresponding region on the map.
        *   Clicking a region selects it (changes visual state).
    *   **Performance:** Check if the map is responsive (pan/zoom) compared to MapLibre.

## Notes on Implementation
*   **Code Structure:**
    *   `src/lib/components/BarChart.svelte`: Replaced with ECharts.
    *   `src/lib/components/ScatterPlot.svelte`: Replaced with ECharts.
    *   `src/lib/components/MapViewECharts.svelte`: New ECharts map component.
    *   `src/routes/echarts-full/`: New route for the full ECharts demo.
    *   `src/lib/components/MapPage.svelte`: Updated to accept `mapComponent` prop.
