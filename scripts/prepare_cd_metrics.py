#!/usr/bin/env python3
"""
Prepare primary metrics CSV for CTP susceptibility map.

Transforms CTP-EN_CommunitySusceptibilityScores.csv into template format.
"""

import pandas as pd
import sys
from pathlib import Path

# Province code to name mapping
PROVINCE_NAMES = {
    '10': 'Newfoundland and Labrador',
    '11': 'Prince Edward Island',
    '12': 'Nova Scotia',
    '13': 'New Brunswick',
    '24': 'Quebec',
    '35': 'Ontario',
    '46': 'Manitoba',
    '47': 'Saskatchewan',
    '48': 'Alberta',
    '59': 'British Columbia',
    '60': 'Yukon',
    '61': 'Northwest Territories',
    '62': 'Nunavut'
}

def main():
    # File paths
    input_file = Path('data/raw/CTP-EN_CommunitySusceptibilityScores.csv')
    output_file = Path('static/data/cd_metrics.csv')

    print(f"Reading input file: {input_file}")

    # Read CSV
    df = pd.read_csv(input_file)

    print(f"Loaded {len(df)} rows")

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Rename columns
    df = df.rename(columns={
        'CD UID': 'GeoUID',
        'CD name': 'CD_Name',
        'Labour force (2021)': 'Labour_Force'
    })

    # Extract province code from GeoUID (first 2 digits)
    df['Province'] = df['GeoUID'].astype(str).str[:2]

    # Map province code to name
    df['Province_Name'] = df['Province'].map(PROVINCE_NAMES)

    # Normalize scores to 0-1 range (handle cases where max might be > 1)
    for score_col in ['IS score', 'MS score', 'FS score']:
        max_val = df[score_col].max()
        if max_val > 1.0:
            print(f"[INFO] Normalizing {score_col}: max={max_val:.4f}, dividing by {max_val}")
            df[score_col] = df[score_col] / max_val

    # Calculate Top_Score_Normalized = max(IS_score, MS_score, FS_score)
    df['Top_Score_Normalized'] = df[['IS score', 'MS score', 'FS score']].max(axis=1)

    # Create Top_Metrics field (which metrics equal Top Score)
    def get_top_metrics(row):
        top_score = row['Top Score']
        metrics = []

        if row['IS'] == top_score:
            metrics.append('IS')
        if row['MS'] == top_score:
            metrics.append('MS')
        if row['FS'] == top_score:
            metrics.append('FS')

        return '+'.join(metrics) if metrics else 'N/A'

    df['Top_Metrics'] = df.apply(get_top_metrics, axis=1)

    # Rename score columns to remove spaces
    df = df.rename(columns={
        'Top Score': 'Top_Score',
        'IS score': 'IS_score',
        'MS score': 'MS_score',
        'FS score': 'FS_score'
    })

    # Select and order final columns
    output_columns = [
        'GeoUID', 'CD_Name', 'Province', 'Province_Name', 'Labour_Force',
        'Top_Score', 'Top_Score_Normalized', 'Top_Metrics',
        'IS', 'IS_score', 'MS', 'MS_score', 'FS', 'FS_score'
    ]

    df_output = df[output_columns]

    # Ensure output directory exists
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Write output
    df_output.to_csv(output_file, index=False)

    print(f"[OK] Wrote {len(df_output)} rows to {output_file}")
    print(f"[OK] Columns: {list(df_output.columns)}")
    print(f"\nSample rows:")
    print(df_output.head(3).to_string())

    # Validation checks
    print(f"\n=== Validation ===")
    print(f"Missing Province_Name: {df_output['Province_Name'].isna().sum()}")
    print(f"Missing Top_Metrics: {(df_output['Top_Metrics'] == 'N/A').sum()}")
    print(f"Top_Metrics with ties: {(df_output['Top_Metrics'].str.contains('\\+')).sum()}")
    print(f"\nTop_Metrics value counts:")
    print(df_output['Top_Metrics'].value_counts().head(10))

    return 0

if __name__ == '__main__':
    sys.exit(main())
