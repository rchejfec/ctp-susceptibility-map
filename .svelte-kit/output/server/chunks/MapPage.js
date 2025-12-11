import { a as store_get, h as head, u as unsubscribe_stores, e as ensure_array_like, c as attr_style, d as stringify, f as attr_class, g as attr, b as bind_props } from "./index.js";
import { d as ssr_context, e as escape_html, g as getContext, a6 as setContext } from "./context.js";
import { d as derived, w as writable } from "./index2.js";
import "clsx";
import "maplibre-gl";
import "d3";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const mapConfig = {
  // ============================================================================
  // PROJECT METADATA
  // ============================================================================
  project: {
    title: "",
    // Empty for iframe use
    subtitle: "",
    description: "Census Division Trade/Tariff Impact Susceptibility"
  },
  // ============================================================================
  // DATA SOURCES
  // ============================================================================
  data: {
    geometry: "data/census_divisions.geojson",
    metrics: "data/cd_metrics.csv",
    supplementary: "data/cd_supplementary.csv"
    // NAICS sector details
  },
  // ============================================================================
  // FIELD MAPPING
  // ============================================================================
  fields: {
    geometry: {
      idField: "GeoUID",
      nameField: "CD_Name",
      // Changed from Region_Name
      provinceField: "Province"
    },
    metrics: {
      idField: "GeoUID",
      provinceField: "Province"
    },
    supplementary: {
      idField: "GeoUID",
      metricField: "Metric"
    }
  },
  // ============================================================================
  // METRICS DEFINITIONS - 4 categorical metrics (0-5 scale)
  // ============================================================================
  metrics: [
    // Metric 1: Top Score (default metric, shown first in dropdown)
    {
      id: "top_score",
      column: "Top_Score",
      label: "Top Score",
      description: "Highest susceptibility score across all metrics",
      type: "categorical",
      scatterYColumn: "Top_Score_Normalized",
      scale: {
        categories: [0, 1, 2, 3, 4, 5],
        colors: {
          0: "#E0E0E0",
          1: "#B3CDE3",
          2: "#6497B1",
          3: "#FDB863",
          4: "#E08214",
          5: "#B2182B"
        },
        labels: {
          0: "No susceptibility",
          1: "Least susceptible (below mean)",
          2: "Less susceptible (above mean)",
          3: "Susceptible (top 10%)",
          4: "More susceptible (top 5%)",
          5: "Most susceptible (top 2%)"
        }
      },
      format: (value) => {
        const labels = {
          0: "No susceptibility",
          1: "Least susceptible",
          2: "Less susceptible",
          3: "Susceptible",
          4: "More susceptible",
          5: "Most susceptible"
        };
        return labels[value] || "N/A";
      },
      tooltip: {
        fields: ["CD_Name", "Top_Score", "Top_Score_Normalized", "Top_Metrics"],
        format: {
          Top_Score_Normalized: (val) => val != null ? val.toFixed(3) : "N/A"
        }
      }
    },
    // Metric 2: Import Susceptibility (IS)
    {
      id: "import_susceptibility",
      column: "IS",
      label: "Import Susceptibility",
      description: "Vulnerability to import disruptions",
      type: "categorical",
      scatterYColumn: "IS_score",
      // For scatter chart dynamic Y-axis
      scale: {
        categories: [0, 1, 2, 3, 4, 5],
        colors: {
          0: "#E0E0E0",
          // Gray - No susceptibility
          1: "#B3CDE3",
          // Light blue - Least susceptible
          2: "#6497B1",
          // Blue - Less susceptible
          3: "#FDB863",
          // Yellow - Susceptible
          4: "#E08214",
          // Orange - More susceptible
          5: "#B2182B"
          // Red - Most susceptible
        },
        labels: {
          0: "No susceptibility",
          1: "Least susceptible (below mean)",
          2: "Less susceptible (above mean)",
          3: "Susceptible (top 10%)",
          4: "More susceptible (top 5%)",
          5: "Most susceptible (top 2%)"
        }
      },
      format: (value) => {
        const labels = {
          0: "No susceptibility",
          1: "Least susceptible",
          2: "Less susceptible",
          3: "Susceptible",
          4: "More susceptible",
          5: "Most susceptible"
        };
        return labels[value] || "N/A";
      },
      tooltip: {
        fields: ["CD_Name", "IS", "IS_score"],
        format: {
          IS_score: (val) => val != null ? val.toFixed(3) : "N/A"
        }
      }
    },
    // Metric 3: Manufacturing Susceptibility (MS)
    {
      id: "manufacturing_susceptibility",
      column: "MS",
      label: "Manufacturing Susceptibility",
      description: "Vulnerability to manufacturing disruptions",
      type: "categorical",
      scatterYColumn: "MS_score",
      scale: {
        categories: [0, 1, 2, 3, 4, 5],
        colors: {
          0: "#E0E0E0",
          1: "#B3CDE3",
          2: "#6497B1",
          3: "#FDB863",
          4: "#E08214",
          5: "#B2182B"
        },
        labels: {
          0: "No susceptibility",
          1: "Least susceptible (below mean)",
          2: "Less susceptible (above mean)",
          3: "Susceptible (top 10%)",
          4: "More susceptible (top 5%)",
          5: "Most susceptible (top 2%)"
        }
      },
      format: (value) => {
        const labels = {
          0: "No susceptibility",
          1: "Least susceptible",
          2: "Less susceptible",
          3: "Susceptible",
          4: "More susceptible",
          5: "Most susceptible"
        };
        return labels[value] || "N/A";
      },
      tooltip: {
        fields: ["CD_Name", "MS", "MS_score"],
        format: {
          MS_score: (val) => val != null ? val.toFixed(3) : "N/A"
        }
      }
    },
    // Metric 4: Fossil Fuel Susceptibility (FS)
    {
      id: "fossil_fuel_susceptibility",
      column: "FS",
      label: "Fossil Fuel Susceptibility",
      description: "Vulnerability to fossil fuel sector impacts",
      type: "categorical",
      scatterYColumn: "FS_score",
      scale: {
        categories: [0, 1, 2, 3, 4, 5],
        colors: {
          0: "#E0E0E0",
          1: "#B3CDE3",
          2: "#6497B1",
          3: "#FDB863",
          4: "#E08214",
          5: "#B2182B"
        },
        labels: {
          0: "No susceptibility",
          1: "Least susceptible (below mean)",
          2: "Less susceptible (above mean)",
          3: "Susceptible (top 10%)",
          4: "More susceptible (top 5%)",
          5: "Most susceptible (top 2%)"
        }
      },
      format: (value) => {
        const labels = {
          0: "No susceptibility",
          1: "Least susceptible",
          2: "Less susceptible",
          3: "Susceptible",
          4: "More susceptible",
          5: "Most susceptible"
        };
        return labels[value] || "N/A";
      },
      tooltip: {
        fields: ["CD_Name", "FS", "FS_score"],
        format: {
          FS_score: (val) => val != null ? val.toFixed(3) : "N/A"
        }
      }
    }
  ],
  defaultMetric: "top_score",
  // ============================================================================
  // LAYOUT CONFIGURATION
  // ============================================================================
  layout: {
    row1: {
      infoCardPlacement: "row1-sidebar"
      // Info card in sidebar
    },
    row2: {
      enabled: true,
      // Explicitly enable Row 2
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
    borderColor: "#333",
    borderWidth: 0.5,
    hoverBorderColor: "#000",
    hoverBorderWidth: 2,
    selectedBorderColor: "#FFD700",
    selectedBorderWidth: 3,
    highlightedBorderColor: "#FF6B6B",
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
      position: "top",
      style: "dropdown"
    },
    provinceFilter: {
      enabled: true,
      label: "Filter by Province",
      includeAll: true,
      allLabel: "All Canada"
    },
    searchBar: {
      enabled: true,
      placeholder: "Search census divisions...",
      searchFields: ["CD_Name"],
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
      position: "bottom-right"
    }
  },
  // ============================================================================
  // DETAIL PANELS
  // ============================================================================
  detailPanels: [
    // Panel 1: Simple Display Card (in sidebar)
    {
      id: "basic_info",
      title: "Region Details",
      type: "fields",
      fields: [
        { key: "Province_Name", label: "Province" },
        { key: "Labour_Force", label: "Labour Force" },
        { key: "Top_Score", label: "Top Score" },
        { key: "Top_Metrics", label: "Top Score Metric(s)" }
      ],
      format: (value, field) => {
        if (value == null || value === "") return "N/A";
        if (field.key === "Labour_Force" && typeof value === "number") {
          return value.toLocaleString();
        }
        return value;
      }
    },
    // Panel 2: NAICS Detail Table (for DetailPanel2 in Row 2)
    {
      id: "naics_detail",
      title: "Sector Details",
      type: "custom",
      template: "table"
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
      title: "Share of PT Labour Force in High Susceptibility CDs",
      position: "row2",
      // Data configuration
      groupBy: "Province_Name",
      aggregateColumn: "Labour_Force",
      aggregateFunction: "share_by_category",
      // Custom function (to be implemented)
      filterConfig: {
        scoreThreshold: 3,
        categories: [3, 4, 5],
        asPercentage: true
      },
      // Axis configuration
      orientation: "horizontal",
      xLabel: "Share of PT Labour Force (%) →",
      yLabel: null,
      xFormat: ".1%",
      // Percentage format
      // Styling
      sort: "descending",
      stacked: true,
      // Enable stacked bars
      colorBy: "category",
      // Color by score category
      colors: {
        3: "#FDB863",
        // Yellow
        4: "#E08214",
        // Orange
        5: "#B2182B"
        // Red
      },
      barColor: "#4A90E2",
      // Fallback (not used with colorBy)
      highlightColor: "#FFD700",
      selectedColor: "#FF6B6B",
      dimOpacity: 0.3,
      height: 300,
      // Interactions
      clickToFilter: false,
      linkedHighlight: true
    },
    // Scatter Plot - Labour Force vs Susceptibility Score
    scatterChart: {
      enabled: true,
      title: "Labour Force vs Susceptibility Score",
      position: "row2",
      // Data configuration - yColumn is dynamic via scatterYColumn
      xColumn: "Labour_Force",
      yColumn: "IS_score",
      // Default, will be overridden by scatterYColumn
      // Axis configuration
      xLabel: "Labour Force (2021) →",
      yLabel: "↑ Susceptibility Score (0-1)",
      xScale: "log",
      yScale: "linear",
      xFormat: "~s",
      yFormat: ".2f",
      // Styling
      pointColor: "#4A90E2",
      pointRadius: 4,
      highlightColor: "#FFD700",
      highlightRadius: 6,
      selectedColor: "#FF6B6B",
      selectedRadius: 7,
      height: 300,
      // Interactions
      linkedHighlight: true,
      showTooltip: true
    }
  }
};
const northernRegions = {
  ontario: [
    "3548",
    "3549",
    "3551",
    "3552",
    "3553",
    "3554",
    "3556",
    "3557",
    "3558",
    "3559",
    "3560"
  ],
  quebec: [
    "2491",
    "2492",
    "2493",
    "2494",
    "2495",
    "2496",
    "2497",
    "2498",
    "2499"
  ]
};
const regionGroups = {
  "southern-quebec": {
    id: "southern-quebec",
    label: "Southern Quebec",
    provinceCode: "24",
    provinceName: "Quebec",
    excludeRegions: northernRegions.quebec
  },
  "southern-ontario": {
    id: "southern-ontario",
    label: "Southern Ontario",
    provinceCode: "35",
    provinceName: "Ontario",
    excludeRegions: northernRegions.ontario
  }
};
mapConfig.regionGroups = {
  enabled: true,
  groups: regionGroups
};
const geoData = writable(null);
const metricsData = writable(null);
const supplementaryData = writable(null);
const selectedMetric = writable(mapConfig.defaultMetric);
const selectedProvince = writable(null);
const selectedRegion = writable(null);
const searchQuery = writable("");
const currentMetricConfig = derived([selectedMetric], ([$selectedMetric]) => {
  return mapConfig.metrics.find((m) => m.id === $selectedMetric) || mapConfig.metrics[0];
});
derived(
  [metricsData, selectedProvince],
  ([$metricsData, $selectedProvince]) => {
    if (!$metricsData) return [];
    if (!$selectedProvince) return $metricsData;
    if (isRegionGroup($selectedProvince)) {
      return $metricsData;
    }
    mapConfig?.fields?.metrics?.provinceField || "Province";
    return $metricsData.filter((d) => d.Province_Name === $selectedProvince);
  }
);
derived(
  [metricsData, searchQuery],
  ([$metricsData, $searchQuery]) => {
    if (!$metricsData || !$searchQuery || $searchQuery.length < 2) {
      return [];
    }
    const searchFields = mapConfig?.features?.searchBar?.searchFields || ["Region_Name"];
    const maxResults = mapConfig?.features?.searchBar?.maxResults || 10;
    const fuzzy = mapConfig?.features?.searchBar?.fuzzyMatch ?? true;
    const query = $searchQuery.toLowerCase();
    const results = $metricsData.filter((item) => {
      return searchFields.some((field) => {
        const value = String(item[field] || "").toLowerCase();
        return fuzzy ? value.includes(query) : value.startsWith(query);
      });
    });
    return results.slice(0, maxResults);
  }
);
const selectedRegionData = derived(
  [metricsData, selectedRegion],
  ([$metricsData, $selectedRegion]) => {
    if (!$metricsData || !$selectedRegion) return null;
    const idField = mapConfig?.fields?.metrics?.idField || "GeoUID";
    return $metricsData.find((d) => String(d[idField]) === String($selectedRegion));
  }
);
const selectedRegionSupplementary = derived(
  [supplementaryData, selectedRegion],
  ([$supplementaryData, $selectedRegion]) => {
    if (!$supplementaryData || !$selectedRegion) return null;
    const idField = mapConfig.fields?.supplementary?.idField || "GeoUID";
    return $supplementaryData.filter((d) => String(d[idField]) === String($selectedRegion));
  }
);
function isRegionGroup(value) {
  if (!value) return false;
  const groups = mapConfig.regionGroups?.groups || {};
  return Object.keys(groups).includes(value);
}
const defaultLayout = {
  // Layout mode: 'sidebar' or 'two-column'
  // 'sidebar' = Map on left, sidebar on right, optional Row 2 below
  // 'two-column' = Map on left (full height), stacked components on right (full height)
  mode: "sidebar",
  row1: {
    // Height behavior
    heightMode: "viewport",
    // 'viewport' | 'content' | 'fixed'
    minHeight: "500px",
    maxHeight: "70vh",
    // Column structure (desktop)
    columns: {
      map: {
        flex: 1,
        // Takes remaining space
        minWidth: "600px"
      },
      sidebar: {
        width: "320px",
        // Fixed width
        minWidth: "280px",
        maxWidth: "400px"
      }
    },
    // Sidebar components (order matters)
    sidebarComponents: [
      { type: "controls", required: true },
      { type: "infoCard", required: false }
    ]
  },
  row2: {
    // Visibility
    enabled: "auto",
    // 'auto' | true | false
    // 'auto' = show if any components enabled
    // Components array (user configures this)
    components: [],
    // Layout behavior
    gap: "1rem",
    heightMode: "content",
    // Row 2 is content-driven
    maxHeight: "40vh",
    // Responsive collapse
    collapseMode: "stack",
    // 'stack' | 'hide' | 'tabs'
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
const defaultFeatures = {
  controls: {
    card: {
      enabled: true,
      title: "Controls",
      collapsible: false,
      defaultExpanded: true
    },
    metricSwitcher: {
      enabled: true,
      style: "dropdown",
      // 'dropdown' | 'tabs' | 'radio'
      position: "top",
      // Order within controls card
      label: "Select Metric",
      showDescription: false
    },
    searchBar: {
      enabled: true,
      position: "middle",
      placeholder: "Search regions...",
      searchFields: ["Region_Name"],
      fuzzyMatch: true,
      maxResults: 10,
      highlightMatches: true
    },
    provinceFilter: {
      enabled: true,
      position: "bottom",
      label: "Filter by Province",
      includeAll: true,
      allLabel: "All Canada",
      autoZoom: true
    }
  },
  infoCard: {
    enabled: true,
    // SIMPLE: User manually configures where it goes
    placement: "row1-sidebar",
    // 'row1-sidebar' | 'row2'
    // If placed in row2
    row2Config: {
      width: 1,
      // Width ratio if moved to Row 2
      align: "center",
      // 'start' | 'center' | 'end'
      maxWidth: "50%",
      order: 0
      // Render order (lower = first)
    },
    // Content configuration
    content: {
      showTitle: true,
      title: "Selected Region",
      emptyState: "Select a region to view details",
      fields: []
      // User configures in mapConfig
    },
    // Interaction
    clearButton: true,
    exportButton: false
  },
  legend: {
    enabled: true,
    // Position
    position: "overlay",
    // 'overlay' | 'sidebar' | 'row2'
    overlay: {
      location: "bottom-right",
      // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
      offset: { x: 20, y: 20 }
    },
    // Style
    style: "compact",
    // 'compact' | 'expanded'
    background: "rgba(255, 255, 255, 0.85)",
    backdrop: true,
    // Backdrop blur
    // Content
    showTitle: true,
    title: "auto",
    // 'auto' uses metric label, or custom string
    format: "auto",
    // Uses metric format function
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
const defaultCharts = {
  barChart: {
    enabled: false,
    title: "by Province",
    position: "row2",
    // Where it renders
    // Row 2 placement
    row2Config: {
      width: 2,
      // Width ratio
      minWidth: "400px",
      order: 1
    },
    // Data configuration
    groupBy: "Province_Name",
    aggregateColumn: "Pop_2021",
    // Changes with metric
    aggregateFunction: "sum",
    // 'sum', 'mean', 'median', 'count'
    // Axis configuration
    orientation: "horizontal",
    xLabel: null,
    yLabel: null,
    xFormat: "~s",
    // Styling
    sort: "descending",
    barColor: "#4A90E2",
    highlightColor: "#FFD700",
    height: 300,
    // Interactions
    clickToFilter: false,
    linkedHighlight: true
  },
  scatterChart: {
    enabled: false,
    title: "Scatter Plot",
    position: "row2",
    // Row 2 placement
    row2Config: {
      width: 1,
      minWidth: "300px",
      order: 2
    },
    // Data configuration
    xColumn: null,
    // User must configure
    yColumn: null,
    sizeColumn: null,
    colorColumn: null,
    // Axis configuration
    xLabel: null,
    yLabel: null,
    xScale: "linear",
    yScale: "linear",
    xFormat: "~s",
    yFormat: "~s",
    // Styling
    pointColor: "#4A90E2",
    pointRadius: 4,
    highlightColor: "#FFD700",
    highlightRadius: 6,
    height: 300,
    // Interactions
    linkedHighlight: true,
    showTooltip: true
  },
  table: {
    enabled: false,
    title: "Data Table",
    position: "row2",
    // Row 2 placement
    row2Config: {
      width: 1,
      minWidth: "400px",
      order: 3
    },
    // Content
    columns: [],
    // User configures
    sortable: true,
    searchable: true,
    pagination: true,
    rowsPerPage: 10,
    // Styling
    height: 300,
    scrollable: true
    // Tables are allowed to scroll!
  }
};
const defaultStyle = {
  fillOpacity: 0.7,
  borderColor: "#333",
  borderWidth: 0.5,
  hoverBorderColor: "#000",
  hoverBorderWidth: 2,
  selectedBorderColor: "#FFD700",
  selectedBorderWidth: 3,
  highlightedBorderColor: "#FF6B6B",
  highlightedBorderWidth: 2.5
};
const defaultViewport = {
  bounds: [-141, 41.5, -52, 70],
  // Canada bounds
  padding: 20,
  maxZoom: 6,
  provincePadding: 50,
  provinceMaxZoom: 7
};
function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
function getFullConfig(userConfig) {
  const layoutMerged = deepMerge(defaultLayout, userConfig.layout || {});
  if (userConfig.layout?.row2?.components) {
    layoutMerged.row2.components = userConfig.layout.row2.components;
  }
  const config = {
    ...userConfig,
    layout: layoutMerged,
    features: deepMerge(defaultFeatures, userConfig.features || {}),
    charts: deepMerge(defaultCharts, userConfig.charts || {}),
    style: deepMerge(defaultStyle, userConfig.style || {}),
    viewport: deepMerge(defaultViewport, userConfig.viewport || {})
  };
  return config;
}
function getRow2Components(config) {
  const fullConfig = getFullConfig(config);
  const components = [];
  const isTwoColumnMode = fullConfig.layout.mode === "two-column";
  if (isTwoColumnMode && fullConfig.features.infoCard.enabled) {
    components.push({
      type: "infoCard",
      ...fullConfig.features.infoCard.row2Config
    });
  } else if (!isTwoColumnMode && fullConfig.layout.row1.infoCardPlacement === "row2") {
    components.push({
      type: "infoCard",
      ...fullConfig.features.infoCard.row2Config
    });
  }
  if (fullConfig.layout.row2?.components?.infoCard2) {
    components.push({
      type: "infoCard2",
      ...fullConfig.layout.row2.components.infoCard2
    });
  }
  Object.entries(fullConfig.charts).forEach(([chartType, chartConfig]) => {
    if (chartConfig.enabled) {
      if (isTwoColumnMode || chartConfig.position === "row2") {
        const userChartConfig = fullConfig.layout.row2?.components?.[chartType];
        components.push({
          type: chartType,
          ...chartConfig.row2Config,
          ...userChartConfig || {}
          // User config overrides defaults
        });
      }
    }
  });
  components.sort((a, b) => (a.order || 0) - (b.order || 0));
  return components;
}
function getRow2GridTemplate(config) {
  const components = getRow2Components(config);
  if (components.length === 0) {
    return "1fr";
  }
  const template = components.map((c) => `${c.width || 1}fr`).join(" ");
  return template;
}
function shouldShowRow2(config) {
  const fullConfig = getFullConfig(config);
  const row2Config = fullConfig.layout.row2;
  if (row2Config.enabled === false) return false;
  if (row2Config.enabled === true) return true;
  const components = getRow2Components(fullConfig);
  return components.length > 0;
}
function MapView($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const idField = mapConfig.fields?.geometry?.idField || "GeoUID";
    mapConfig.fields?.geometry?.nameField || "Region_Name";
    mapConfig.fields?.geometry?.provinceField || "Province";
    function processData() {
      if (!store_get($$store_subs ??= {}, "$geoData", geoData) || !store_get($$store_subs ??= {}, "$metricsData", metricsData)) return;
      const dataLookup = new Map(store_get($$store_subs ??= {}, "$metricsData", metricsData).map((d) => [String(d[idField]), d]));
      store_get($$store_subs ??= {}, "$geoData", geoData).features.forEach((feature) => {
        const uid = feature.properties[idField];
        const metric = dataLookup.get(uid);
        if (metric) {
          feature.properties = { ...feature.properties, ...metric };
        }
      });
    }
    onDestroy(() => {
    });
    if (store_get($$store_subs ??= {}, "$geoData", geoData) && store_get($$store_subs ??= {}, "$metricsData", metricsData)) {
      processData();
    }
    head("njbu1f", $$renderer2, ($$renderer3) => {
      $$renderer3.push(`<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.css"/>`);
    });
    $$renderer2.push(`<div class="map-container svelte-njbu1f"></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Legend($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let legendItems, legendTitle;
    function getLegendItems(metricConfig) {
      if (!metricConfig) return [];
      if (metricConfig.type === "continuous") {
        const labels = metricConfig.scale?.legendLabels;
        const colors = metricConfig.scale?.colors;
        if (!labels || !colors) return [];
        return [...labels].reverse().map((item, i) => {
          const colorIndex = colors.length - 1 - i;
          const color = colors[colorIndex] ? colors[colorIndex][1] : colors[colors.length - 1][1];
          return { label: item.label, color };
        });
      } else if (metricConfig.type === "categorical") {
        const categories = metricConfig.scale?.categories;
        const colors = metricConfig.scale?.colors;
        const labels = metricConfig.scale?.labels;
        if (!categories || !colors) return [];
        return [...categories].reverse().map((category) => ({
          label: labels?.[category] || String(category),
          color: colors[category]
        }));
      }
      return [];
    }
    legendItems = getLegendItems(store_get($$store_subs ??= {}, "$currentMetricConfig", currentMetricConfig));
    legendTitle = store_get($$store_subs ??= {}, "$currentMetricConfig", currentMetricConfig)?.label || "Legend";
    $$renderer2.push(`<div class="legend svelte-1wfxrff"><h3 class="svelte-1wfxrff">${escape_html(legendTitle)}</h3> <div class="legend-items svelte-1wfxrff"><!--[-->`);
    const each_array = ensure_array_like(legendItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<div class="legend-item svelte-1wfxrff"><div class="legend-color svelte-1wfxrff"${attr_style(`background-color: ${stringify(item.color)}`)}></div> <span class="svelte-1wfxrff">${escape_html(item.label)}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ProvinceFilter($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const config = mapConfig.features?.provinceFilter || {};
    const label = config.label || "Province/Territory";
    const allLabel = config.allLabel || "All Provinces";
    const showRegionGroups = mapConfig.regionGroups?.enabled ?? false;
    let provinces = [];
    if (store_get($$store_subs ??= {}, "$metricsData", metricsData)) {
      provinces = [
        ...new Set(store_get($$store_subs ??= {}, "$metricsData", metricsData).map((d) => d.Province_Name).filter((p) => p != null && p !== "Unknown"))
      ].sort();
    }
    $$renderer2.push(`<div class="filter svelte-1qrmnmq"><label for="province-filter" class="svelte-1qrmnmq">${escape_html(label)}</label> `);
    $$renderer2.select(
      {
        id: "province-filter",
        value: store_get($$store_subs ??= {}, "$selectedProvince", selectedProvince) || "",
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(allLabel)}`);
        });
        if (showRegionGroups) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<optgroup label="Region Groups"><!--[-->`);
          const each_array = ensure_array_like(Object.values(regionGroups));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let group = each_array[$$index];
            $$renderer3.option({ value: group.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(group.label)}`);
            });
          }
          $$renderer3.push(`<!--]--></optgroup> <optgroup label="Provinces"><!--[-->`);
          const each_array_1 = ensure_array_like(provinces);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let province = each_array_1[$$index_1];
            $$renderer3.option({ value: province }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(province)}`);
            });
          }
          $$renderer3.push(`<!--]--></optgroup>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(provinces);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let province = each_array_2[$$index_2];
            $$renderer3.option({ value: province }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(province)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      "svelte-1qrmnmq"
    );
    $$renderer2.push(`</div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DetailPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const panels = mapConfig.detailPanels ? [mapConfig.detailPanels[0]] : [];
    const nameField = mapConfig.fields?.geometry?.nameField || "Region_Name";
    function renderFieldsPanel(panel, data) {
      if (!data || !panel.fields) return [];
      return panel.fields.map((field) => {
        const value = data[field.key];
        const formatted = panel.format ? panel.format(value, field) : formatValue(value, field);
        return { label: field.label, value: formatted };
      });
    }
    function formatValue(value, field) {
      if (value == null || value === "") return "N/A";
      const prefix = field.prefix || "";
      const suffix = field.suffix || "";
      if (typeof value === "number") {
        return `${prefix}${value.toLocaleString()}${suffix}`;
      }
      return `${prefix}${value}${suffix}`;
    }
    $$renderer2.push(`<div class="detail-panel svelte-ofd6sl"><div class="panel-header svelte-ofd6sl"><h3 class="svelte-ofd6sl">Region Details</h3> `);
    if (store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="clear-btn svelte-ofd6sl" title="Clear selection">×</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="panel-content svelte-ofd6sl">`);
    if (store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="region-name svelte-ofd6sl">${escape_html(store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)[nameField])}</div> <!--[-->`);
      const each_array = ensure_array_like(panels);
      for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
        let panel = each_array[$$index_3];
        $$renderer2.push(`<div class="panel-section svelte-ofd6sl">`);
        if (panel.title) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<h4 class="section-title svelte-ofd6sl">${escape_html(panel.title)}</h4>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (panel.type === "fields") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="fields svelte-ofd6sl"><!--[-->`);
          const each_array_1 = ensure_array_like(renderFieldsPanel(panel, store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)));
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let field = each_array_1[$$index];
            $$renderer2.push(`<div class="field-row svelte-ofd6sl"><span class="field-label svelte-ofd6sl">${escape_html(field.label)}:</span> <span class="field-value svelte-ofd6sl">${escape_html(field.value)}</span></div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (panel.type === "custom") {
            $$renderer2.push("<!--[-->");
            if (store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary) && store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary).length > 0) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="custom-content svelte-ofd6sl">`);
              if (panel.template === "list") {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<ul class="supplementary-list svelte-ofd6sl"><!--[-->`);
                const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary));
                for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                  let item = each_array_2[$$index_1];
                  $$renderer2.push(`<li class="svelte-ofd6sl">`);
                  if (item.rank) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<span class="rank svelte-ofd6sl">${escape_html(item.rank)}.</span>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                  }
                  $$renderer2.push(`<!--]--> <span class="item-name svelte-ofd6sl">${escape_html(item.industry || item.name || item.label)}</span> `);
                  if (item.value) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<span class="item-value svelte-ofd6sl">${escape_html(formatValue(item.value, {}))}</span>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                  }
                  $$renderer2.push(`<!--]--></li>`);
                }
                $$renderer2.push(`<!--]--></ul>`);
              } else {
                $$renderer2.push("<!--[!-->");
                if (panel.template === "table") {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<table class="supplementary-table svelte-ofd6sl"><tbody><!--[-->`);
                  const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary));
                  for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
                    let item = each_array_3[$$index_2];
                    $$renderer2.push(`<tr class="svelte-ofd6sl">`);
                    if (item.rank) {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<td class="rank-col svelte-ofd6sl">${escape_html(item.rank)}</td>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                    }
                    $$renderer2.push(`<!--]--><td class="name-col svelte-ofd6sl">${escape_html(item.industry || item.name || item.label)}</td>`);
                    if (item.value) {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<td class="value-col svelte-ofd6sl">${escape_html(formatValue(item.value, {}))}</td>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                    }
                    $$renderer2.push(`<!--]--></tr>`);
                  }
                  $$renderer2.push(`<!--]--></tbody></table>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<p class="no-data svelte-ofd6sl">No supplementary data available</p>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<p class="placeholder svelte-ofd6sl">Click a region to view details</p>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function DetailPanel2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let panel, nameField, metricCode, metricFilteredSupp, displayData;
    const configStore = getContext("mapConfig");
    const NAICS_LOOKUP = {
      "311": "Food manufacturing",
      "322": "Paper manufacturing",
      "324": "Petroleum & coal products",
      "325": "Chemical manufacturing",
      "327": "Non-metallic mineral products",
      "331": "Primary metal manufacturing",
      "336": "Transportation equipment",
      "481": "Air transportation",
      "483": "Water transportation",
      "484": "Truck transportation",
      "486": "Pipeline transportation",
      "493": "Warehousing & storage",
      "1125": "Aquaculture",
      "2111": "Oil & gas extraction",
      "2121": "Coal mining",
      "2122": "Metal ore mining",
      "2123": "Non-metallic mineral mining",
      "2131": "Support activities for mining",
      "2211": "Electric power generation",
      "2212": "Natural gas distribution",
      "3221": "Pulp, paper & paperboard mills",
      "3241": "Petroleum & coal products",
      "3313": "Alumina & aluminum production",
      "3314": "Non-ferrous metal production",
      "3315": "Foundries",
      "113": "Forestry",
      "1114": "Greenhouse/nursery",
      "321": "Wood products",
      "3211": "Sawmills",
      "3212": "Plywood",
      "3219": "Other wood",
      "326": "Plastics & rubber",
      "3261": "Plastics",
      "3262": "Rubber",
      "332": "Fabricated metal",
      "3321": "Forging/stamping",
      "333": "Machinery",
      "3344": "HVAC",
      "3361": "Motor vehicles",
      "3363": "Motor vehicle parts",
      "3364": "Aerospace",
      "3399": "Other manufacturing",
      "485": "Transit",
      "4861": "Pipeline (oil)",
      "4862": "Pipeline (gas)",
      "562": "Waste management",
      "5622": "Waste treatment",
      "5629": "Remediation",
      "6113": "Universities",
      "6221": "Hospitals",
      "9111": "Defence",
      "9119": "Other public admin"
    };
    function getSectorName(naicsCode) {
      if (!naicsCode) return "";
      return NAICS_LOOKUP[naicsCode] || `NAICS ${naicsCode}`;
    }
    function getMetricCode(metricId) {
      const mapping = {
        import_susceptibility: "IS",
        manufacturing_susceptibility: "MS",
        fossil_fuel_susceptibility: "FS",
        top_score: null
        // Don't show for Top Score
      };
      return mapping[metricId];
    }
    panel = store_get($$store_subs ??= {}, "$configStore", configStore)?.detailPanels?.[1] || store_get($$store_subs ??= {}, "$configStore", configStore)?.detailPanels?.[0];
    nameField = store_get($$store_subs ??= {}, "$configStore", configStore)?.fields?.geometry?.nameField || "CD_Name";
    metricCode = getMetricCode(store_get($$store_subs ??= {}, "$selectedMetric", selectedMetric));
    metricFilteredSupp = metricCode && store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary) ? store_get($$store_subs ??= {}, "$selectedRegionSupplementary", selectedRegionSupplementary).filter((row) => row.Metric === metricCode) : [];
    displayData = metricFilteredSupp.slice(0, 10);
    $$renderer2.push(`<div class="detail-panel svelte-s014jr"><div class="panel-header svelte-s014jr"><h3 class="svelte-s014jr">${escape_html(
      // Top 10 sectors
      panel?.title || "Sector Details"
    )}</h3></div> <div class="panel-content svelte-s014jr">`);
    if (!store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="placeholder svelte-s014jr">Select a census division to view sector details</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (!metricCode) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="no-data svelte-s014jr">Sector details not available for Top Score metric</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (!metricFilteredSupp || metricFilteredSupp.length === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="no-data svelte-s014jr">No sector data available for this metric</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="region-name svelte-s014jr">${escape_html(store_get($$store_subs ??= {}, "$selectedRegionData", selectedRegionData)[nameField])}</div> <table class="supplementary-table svelte-s014jr"><thead class="svelte-s014jr"><tr><th class="rank-col svelte-s014jr">Rank</th><th class="naics-col svelte-s014jr">NAICS</th><th class="name-col svelte-s014jr">Sector</th><th class="share-col svelte-s014jr">Share</th></tr></thead><tbody class="svelte-s014jr"><!--[-->`);
          const each_array = ensure_array_like(displayData);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let item = each_array[$$index];
            $$renderer2.push(`<tr class="svelte-s014jr"><td class="rank-col svelte-s014jr">${escape_html(item.Rank)}</td><td class="naics-col svelte-s014jr">${escape_html(item.NAICS || "N/A")}</td><td class="name-col svelte-s014jr">${escape_html(getSectorName(item.NAICS))}</td><td class="share-col svelte-s014jr">${escape_html(item.Share)}</td></tr>`);
          }
          $$renderer2.push(`<!--]--></tbody></table>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function MetricSwitcher($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const style = mapConfig.features?.metricSwitcher?.style || "dropdown";
    const metrics = mapConfig.metrics || [];
    if (style === "dropdown") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="metric-switcher-dropdown svelte-19bccjh"><label for="metric-select" class="svelte-19bccjh">Metric:</label> `);
      $$renderer2.select(
        {
          id: "metric-select",
          value: store_get($$store_subs ??= {}, "$selectedMetric", selectedMetric),
          class: ""
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(metrics);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let metric = each_array[$$index];
            $$renderer3.option({ value: metric.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(metric.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        "svelte-19bccjh"
      );
      $$renderer2.push(`</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (style === "tabs") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="metric-switcher-tabs svelte-19bccjh"><!--[-->`);
        const each_array_1 = ensure_array_like(metrics);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let metric = each_array_1[$$index_1];
          $$renderer2.push(`<button${attr_class("tab svelte-19bccjh", void 0, {
            "active": store_get($$store_subs ??= {}, "$selectedMetric", selectedMetric) === metric.id
          })}${attr("title", metric.description || metric.label)}>${escape_html(metric.label)}</button>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function SearchBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const config = mapConfig.features?.searchBar || {};
    const placeholder = config.placeholder || "Search regions...";
    mapConfig.fields?.geometry?.nameField || "Region_Name";
    $$renderer2.push(`<div class="search-bar svelte-yyldap"><div class="search-input-wrapper svelte-yyldap"><svg class="search-icon svelte-yyldap" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg> <input type="text"${attr("placeholder", placeholder)}${attr("value", store_get($$store_subs ??= {}, "$searchQuery", searchQuery))} class="svelte-yyldap"/> `);
    if (store_get($$store_subs ??= {}, "$searchQuery", searchQuery)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="clear-btn svelte-yyldap" title="Clear search">×</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function BarChart($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const chartConfig = mapConfig.charts?.barChart || {};
    chartConfig.height || 300;
    $$renderer2.push(`<div class="bar-chart-container svelte-9fnibp"><h3 class="chart-title svelte-9fnibp">${escape_html(
      /**
       * Map metric ID to score column name
       */
      /**
       * Aggregate data with share calculation by category (for stacked bars)
       */
      // Group by province to calculate total PT labour force
      // Total labour force in this province
      // For each category (3, 4, 5), calculate share
      // Filter CDs with this exact score
      // Sum labour force for this category
      // Calculate share: category labour force / total PT labour force
      // Percentage (0-1 scale)
      // Total share for sorting
      // All items for highlighting
      // Sort by total share
      // Check if we should use stacked aggregation
      // Sort
      // Clear existing
      // Create SVG
      // Aggregate data
      // Scales
      // Axes
      // Render bars (stacked or simple)
      /**
       * Render simple (non-stacked) bars
       */
      // Labels
      /**
       * Render stacked bars by category
       */
      /**
       * Handle mouseover for stacked bar segments
       */
      // Highlight segment
      // Highlight bar
      // Reset bar color
      // Could implement filtering by clicking a bar
      // Don't override selection highlight with hover
      // Reset all bars
      // Highlight bars that contain highlighted regions
      // Find which province contains this region
      // Highlight the bar for this province (red)
      store_get($$store_subs ??= {}, "$currentMetricConfig", currentMetricConfig)?.label || "Metric"
    )} ${escape_html(chartConfig.title || "")}</h3> <div class="chart svelte-9fnibp"></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ScatterPlot($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const chartConfig = mapConfig.charts?.scatterChart || {};
    chartConfig.height || 300;
    $$renderer2.push(`<div class="scatter-plot-container svelte-1teu741"><h3 class="chart-title svelte-1teu741">${escape_html(
      // Clear existing
      // Create SVG
      // Filter data with valid values
      // Use metric-specific scatterYColumn if available (for dynamic Y-axis)
      // Scales
      // Axes
      // Axis labels
      // Create tooltip
      // Points
      // Reset all points
      // Highlight specific points
      // Selected point (distinct from highlight)
      // Cleanup tooltip on unmount
      chartConfig.title || "Scatter Plot"
    )}</h3> <div class="chart svelte-1teu741"></div></div>`);
  });
}
function MapPage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let fullConfig, metricSwitcherEnabled, searchBarEnabled, provinceFilterEnabled, legendEnabled, infoCardEnabled, layoutMode, isTwoColumnMode, infoCardInSidebar, showRow2, row2Components, row2GridTemplate, barChartEnabled, scatterChartEnabled;
    let config = $$props["config"];
    let data = $$props["data"];
    const configStore = writable(fullConfig);
    setContext("mapConfig", configStore);
    if (data?.error) {
      console.error("Error loading data:", data.error);
    }
    fullConfig = getFullConfig(config);
    configStore.set(fullConfig);
    metricSwitcherEnabled = fullConfig.features?.metricSwitcher?.enabled ?? true;
    searchBarEnabled = fullConfig.features?.searchBar?.enabled ?? true;
    provinceFilterEnabled = fullConfig.features?.provinceFilter?.enabled ?? true;
    legendEnabled = fullConfig.features?.legend?.enabled ?? true;
    infoCardEnabled = fullConfig.features?.infoCard?.enabled ?? true;
    layoutMode = fullConfig.layout?.mode || "sidebar";
    isTwoColumnMode = layoutMode === "two-column";
    infoCardInSidebar = !isTwoColumnMode && fullConfig.layout.row1.infoCardPlacement === "row1-sidebar";
    showRow2 = isTwoColumnMode || shouldShowRow2(config);
    row2Components = getRow2Components(config);
    row2GridTemplate = getRow2GridTemplate(config);
    barChartEnabled = fullConfig.charts?.barChart?.enabled ?? false;
    scatterChartEnabled = fullConfig.charts?.scatterChart?.enabled ?? false;
    head("18pooxh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(config.project?.title || "Map Visualization")}</title>`);
      });
    });
    $$renderer2.push(`<div class="container svelte-18pooxh"><header class="svelte-18pooxh"><h1 class="svelte-18pooxh">${escape_html(config.project?.title || "Map Visualization")}</h1> `);
    if (config.project?.subtitle) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="subtitle svelte-18pooxh">${escape_html(config.project.subtitle)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> `);
    if (isTwoColumnMode) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="two-column-grid svelte-18pooxh"><div class="map-section svelte-18pooxh">`);
      MapView($$renderer2);
      $$renderer2.push(`<!----> `);
      if (legendEnabled) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="legend-overlay svelte-18pooxh">`);
        Legend($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="right-column svelte-18pooxh"><div class="sidebar-section filters-card svelte-18pooxh"><h2 class="svelte-18pooxh">Controls</h2> <div class="filter-controls svelte-18pooxh">`);
      if (searchBarEnabled) {
        $$renderer2.push("<!--[-->");
        SearchBar($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (metricSwitcherEnabled && config.metrics && config.metrics.length > 1) {
        $$renderer2.push("<!--[-->");
        MetricSwitcher($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (provinceFilterEnabled) {
        $$renderer2.push("<!--[-->");
        ProvinceFilter($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> <!--[-->`);
      const each_array = ensure_array_like(row2Components);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let component = each_array[$$index];
        if (component.type === "infoCard" && infoCardEnabled) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="sidebar-section details-card svelte-18pooxh">`);
          DetailPanel($$renderer2);
          $$renderer2.push(`<!----></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (component.type === "infoCard2") {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="sidebar-section details-card svelte-18pooxh">`);
            DetailPanel2($$renderer2);
            $$renderer2.push(`<!----></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (component.type === "barChart" && barChartEnabled) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="sidebar-section chart-card svelte-18pooxh">`);
              BarChart($$renderer2);
              $$renderer2.push(`<!----></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (component.type === "scatterChart" && scatterChartEnabled) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div class="sidebar-section chart-card svelte-18pooxh">`);
                ScatterPlot($$renderer2);
                $$renderer2.push(`<!----></div>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="main-grid svelte-18pooxh"><div class="map-section svelte-18pooxh">`);
      MapView($$renderer2);
      $$renderer2.push(`<!----> `);
      if (legendEnabled) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="legend-overlay svelte-18pooxh">`);
        Legend($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="sidebar svelte-18pooxh"><div class="sidebar-section filters-card svelte-18pooxh"><h2 class="svelte-18pooxh">Controls</h2> <div class="filter-controls svelte-18pooxh">`);
      if (searchBarEnabled) {
        $$renderer2.push("<!--[-->");
        SearchBar($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (metricSwitcherEnabled && config.metrics && config.metrics.length > 1) {
        $$renderer2.push("<!--[-->");
        MetricSwitcher($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (provinceFilterEnabled) {
        $$renderer2.push("<!--[-->");
        ProvinceFilter($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (infoCardEnabled && infoCardInSidebar) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="sidebar-section details-card svelte-18pooxh">`);
        DetailPanel($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (showRow2) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="row2-section svelte-18pooxh"${attr_style(`grid-template-columns: ${stringify(row2GridTemplate)};`)}><!--[-->`);
        const each_array_1 = ensure_array_like(row2Components);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let component = each_array_1[$$index_1];
          if (component.type === "infoCard" && infoCardEnabled) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="row2-component info-card-wrapper svelte-18pooxh"${attr_style(`justify-self: ${stringify(component.align || "center")}; max-width: ${stringify(component.maxWidth || "100%")};`)}><div class="sidebar-section details-card svelte-18pooxh">`);
            DetailPanel($$renderer2);
            $$renderer2.push(`<!----></div></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (component.type === "infoCard2") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="row2-component info-card-wrapper svelte-18pooxh" style="justify-self: start; max-width: 100%;"><div class="sidebar-section details-card svelte-18pooxh">`);
              DetailPanel2($$renderer2);
              $$renderer2.push(`<!----></div></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (component.type === "barChart" && barChartEnabled) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div class="row2-component svelte-18pooxh"><div class="sidebar-section svelte-18pooxh">`);
                BarChart($$renderer2);
                $$renderer2.push(`<!----></div></div>`);
              } else {
                $$renderer2.push("<!--[!-->");
                if (component.type === "scatterChart" && scatterChartEnabled) {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<div class="row2-component svelte-18pooxh"><div class="sidebar-section svelte-18pooxh">`);
                  ScatterPlot($$renderer2);
                  $$renderer2.push(`<!----></div></div>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { config, data });
  });
}
export {
  MapPage as M,
  mapConfig as m
};
