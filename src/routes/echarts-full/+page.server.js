/**
 * Static data loader
 *
 * Loads pre-built data for the map application
 * Data is loaded from static JSON files
 */

export const prerender = true;

export async function load({ fetch }) {
	try {
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
			// GeoJSON will be loaded client-side to avoid SSR bloat
			geoDataUrl: '/data/census_divisions.geojson',
			metrics,
			supplementary
		};
	} catch (error) {
		console.error('Error loading data:', error);
		return {
			geoDataUrl: '/data/census_divisions.geojson',
			metrics: null,
			supplementary: null,
			error: error.message
		};
	}
}
