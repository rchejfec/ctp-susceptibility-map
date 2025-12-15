# Testing Instructions: ECharts Migration

This branch replaces the D3-based charts with Apache ECharts. The MapLibre map remains as the core geospatial view, but now interacts with ECharts components.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
    (This ensures `echarts` is installed).

2.  **Build:**
    ```bash
    npm run build
    ```
    (Verify no build errors).

## Verification Steps

### 1. Bar Chart (Stacked & Simple)
*   **Appearance:** The bar chart in Row 2 (or Sidebar depending on layout) should now be rendered by ECharts. It should show the same data structure as before (Province aggregation).
*   **Interaction (Chart -> Map):**
    *   Hover over a bar (or a segment of a stacked bar).
    *   **Expected:** The map should highlight the regions (CDs) corresponding to that province/category.
*   **Interaction (Map -> Chart):**
    *   Hover over a region on the map.
    *   **Expected:** The corresponding bar (Province) in the chart should highlight (light up or change opacity).

### 2. Scatter Plot
*   **Appearance:** The scatter plot should show `Labour_Force` (X, Log scale) vs `Susceptibility Score` (Y, Linear).
*   **Interaction (Chart -> Map):**
    *   Hover over a point.
    *   **Expected:** The specific region (CD) on the map should highlight.
    *   **Click:** Clicking a point should select the region (locking the highlight).
*   **Interaction (Map -> Chart):**
    *   Hover over a region on the map.
    *   **Expected:** The corresponding point in the scatter plot should highlight (enlarge/color change).

### 3. Responsiveness
*   Resize the browser window.
*   **Expected:** The ECharts instances should resize automatically to fit their containers.

## Notes on Implementation
*   **Performance:** ECharts is generally performant. However, linking high-frequency events (mousemove) between MapLibre and ECharts via Svelte stores might introduce slight latency if the dataset is massive.
*   **Styling:** Default ECharts styling was used to match the previous look (Blue/Gold/Red palette), but some minor visual differences (fonts, padding) are expected.
