#!/usr/bin/env node

/**
 * CSV to JSON converter for static builds
 * 
 * Converts CSV files in static/data/ to JSON for faster loading
 * This script runs during the build process
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to convert value to appropriate type
function castValue(value) {
  if (value === '' || value === null || value === undefined) return null;
  
  // Try number
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  
  // Try boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Keep as string
  return value;
}

function convertCsvToJson(csvPath, jsonPath) {
  try {
    console.log(`Converting ${csvPath} → ${jsonPath}`);

    // Read and parse CSV
    let csvContent = readFileSync(csvPath, 'utf-8');

    // Remove BOM if present
    if (csvContent.charCodeAt(0) === 0xFEFF) {
      csvContent = csvContent.slice(1);
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value) => castValue(value)
    });

    // Note: Column normalization is handled by prepare_cd_metrics.py and prepare_cd_supplementary.py
    // The CSV files are already preprocessed with correct column names

    // Write as JSON
    writeFileSync(jsonPath, JSON.stringify(records, null, 2));
    console.log(`✓ Converted ${records.length} records`);

    return true;
  } catch (error) {
    console.error(`✗ Error converting ${csvPath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('Converting CSV files to JSON for static build...\n');

const conversions = [
  {
    csv: 'static/data/cd_metrics.csv',
    json: 'static/data/cd_metrics.json'
  },
  {
    csv: 'static/data/cd_supplementary.csv',
    json: 'static/data/cd_supplementary.json',
    optional: true
  }
];

let success = true;
for (const { csv, json, optional } of conversions) {
  const result = convertCsvToJson(csv, json);
  if (!result && !optional) {
    success = false;
  }
}

if (success) {
  console.log('\n✓ All conversions complete!');
  process.exit(0);
} else {
  console.log('\n✗ Some conversions failed');
  process.exit(1);
}
