async function load({ fetch }) {
  try {
    const geoResponse = await fetch("/data/census_divisions.geojson");
    const geoData = await geoResponse.json();
    const metricsResponse = await fetch("/data/cd_metrics.json");
    const metrics = await metricsResponse.json();
    let supplementary = null;
    try {
      const suppResponse = await fetch("/data/cd_supplementary.json");
      if (suppResponse.ok) {
        supplementary = await suppResponse.json();
      }
    } catch (err) {
      console.log("No supplementary data file found (optional)");
    }
    return {
      geoData,
      metrics,
      supplementary
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      geoData: null,
      metrics: null,
      supplementary: null,
      error: error.message
    };
  }
}
export {
  load
};
