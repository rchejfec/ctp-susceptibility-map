/**
 * Static data loader
 *
 * Loads pre-built data for the map application
 * Data is loaded client-side from static JSON files
 */

export async function load({ fetch }) {
	try {
		// Fetch GeoJSON from static directory
		const geoResponse = await fetch('/data/census_divisions.geojson');
		const geoData = await geoResponse.json();

		// Fetch CSV metrics converted to JSON at build time
		const metricsResponse = await fetch('/data/cd_metrics.json');
		const metrics = await metricsResponse.json();

		// Fetch supplementary data (optional)
		let supplementary = null;
		try {
			const suppResponse = await fetch('/data/cd_supplementary.json');
			if (suppResponse.ok) {
				supplementary = await suppResponse.json();
			}
		} catch (err) {
			console.log('No supplementary data file found (optional)');
		}

		return {
			geoData,
			metrics,
			supplementary
		};
	} catch (error) {
		console.error('Error loading data:', error);
		return {
			geoData: null,
			metrics: null,
			supplementary: null,
			error: error.message
		};
	}
}
