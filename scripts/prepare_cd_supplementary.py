#!/usr/bin/env python3
"""
Prepare supplementary NAICS data CSV for CTP susceptibility map.

Transforms PoR_SuscScores_export_NoAg.csv into long format for detail table.
"""

import pandas as pd
import sys
from pathlib import Path

# NAICS code to sector name mapping
NAICS_LOOKUP = {
    '311': 'Food manufacturing',
    '322': 'Paper manufacturing',
    '324': 'Petroleum & coal products',
    '325': 'Chemical manufacturing',
    '327': 'Non-metallic mineral products',
    '331': 'Primary metal manufacturing',
    '336': 'Transportation equipment',
    '481': 'Air transportation',
    '483': 'Water transportation',
    '484': 'Truck transportation',
    '486': 'Pipeline transportation',
    '493': 'Warehousing & storage',
    '1125': 'Aquaculture',
    '2111': 'Oil & gas extraction',
    '2121': 'Coal mining',
    '2122': 'Metal ore mining',
    '2123': 'Non-metallic mineral mining',
    '2131': 'Support activities for mining',
    '2211': 'Electric power generation',
    '2212': 'Natural gas distribution',
    '3221': 'Pulp, paper & paperboard mills',
    '3241': 'Petroleum & coal products',
    '3313': 'Alumina & aluminum production',
    '3314': 'Non-ferrous metal production',
    '3315': 'Foundries'
}

def clean_naics(naics_value):
    """Clean NAICS code - handle numeric and alphanumeric codes."""
    if pd.isna(naics_value) or naics_value == 'NA':
        return ''

    naics_str = str(naics_value).strip()

    # Try to convert to int (for numeric codes)
    try:
        return str(int(float(naics_str)))
    except (ValueError, TypeError):
        # If it has letters, just keep the string as-is
        return naics_str

def main():
    # File paths
    input_file = Path('data/raw/PoR_SuscScores_export_NoAg.csv')
    output_file = Path('static/data/cd_supplementary.csv')

    print(f"Reading input file: {input_file}")

    # Read CSV
    df = pd.read_csv(input_file)

    print(f"Loaded {len(df)} rows")

    # Create list to hold unpivoted rows
    rows = []

    for _, row in df.iterrows():
        geo_uid = row['geo']

        # Extract IS (ERC) sources
        for i in range(1, 4):  # Source1, Source2, Source3
            naics = row.get(f'ERC_Source{i}')
            share = row.get(f'ERC_Share{i}')

            if pd.notna(naics) and naics != 'NA':
                rows.append({
                    'GeoUID': geo_uid,
                    'Metric': 'IS',
                    'Rank': i,
                    'NAICS': clean_naics(naics),
                    'Share': share if pd.notna(share) else ''
                })

        # Extract MS (MTC_LT) sources
        for i in range(1, 3):  # Source1, Source2
            naics = row.get(f'MTC_LT_Source{i}')
            share = row.get(f'MTC_LT_Share{i}')

            if pd.notna(naics) and naics != 'NA':
                rows.append({
                    'GeoUID': geo_uid,
                    'Metric': 'MS',
                    'Rank': i,
                    'NAICS': clean_naics(naics),
                    'Share': share if pd.notna(share) else ''
                })

        # Extract FS (LFE) sources
        for i in range(1, 3):  # Source1, Source2
            naics = row.get(f'LFE_Source{i}')
            share = row.get(f'LFE_Share{i}')

            if pd.notna(naics) and naics != 'NA':
                rows.append({
                    'GeoUID': geo_uid,
                    'Metric': 'FS',
                    'Rank': i,
                    'NAICS': clean_naics(naics),
                    'Share': share if pd.notna(share) else ''
                })

    # Create dataframe from rows
    df_output = pd.DataFrame(rows)

    # Ensure output directory exists
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Write output
    df_output.to_csv(output_file, index=False)

    print(f"[OK] Wrote {len(df_output)} rows to {output_file}")
    print(f"[OK] Columns: {list(df_output.columns)}")
    print(f"\nSample rows:")
    print(df_output.head(10).to_string())

    # Validation checks
    print(f"\n=== Validation ===")
    print(f"Unique GeoUIDs: {df_output['GeoUID'].nunique()}")
    print(f"Rows per metric:")
    print(df_output['Metric'].value_counts())
    print(f"\nUnique NAICS codes: {df_output['NAICS'].nunique()}")
    print(f"NAICS codes in lookup: {sum(1 for code in df_output['NAICS'].unique() if code in NAICS_LOOKUP)}")

    # Show codes not in lookup
    missing_codes = set(df_output['NAICS'].unique()) - set(NAICS_LOOKUP.keys()) - {''}
    if missing_codes:
        print(f"\nNAICS codes not in lookup table ({len(missing_codes)}):")
        print(sorted(missing_codes))

    return 0

if __name__ == '__main__':
    sys.exit(main())
