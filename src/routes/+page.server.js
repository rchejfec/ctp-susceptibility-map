import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * Server-side data loader
 *
 * Loads and prepares data for the map application
 */

export async function load() {
	try {
		// Load GeoJSON
		const geoJsonPath = 'static/data/census_divisions.geojson';
		const geoData = JSON.parse(readFileSync(geoJsonPath, 'utf-8'));

		// Load CSV metrics
		const csvPath = 'static/data/cd_metrics.csv';
		const csvContent = readFileSync(csvPath, 'utf-8');

		// Parse CSV with type conversion
		const metrics = parse(csvContent, {
			columns: true,
			skip_empty_lines: true,
			cast: (value, context) => {
				// Try to convert to number if possible
				if (context.header) return value;
				const num = Number(value);
				return isNaN(num) ? value : num;
			}
		});

		// Load supplementary data (optional - for filter-aware detail panels)
		let supplementary = null;
		try {
			const suppPath = 'static/data/cd_supplementary.csv';
			const suppContent = readFileSync(suppPath, 'utf-8');
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
			// Supplementary data is optional - no error if file doesn't exist
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
