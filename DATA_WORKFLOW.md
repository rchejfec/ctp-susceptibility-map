# Data Processing Workflow

## Overview

This project uses a multi-step data processing workflow to prepare data for deployment.

## Workflow Steps

### 1. Raw Data (Not in Git)
Raw data files are stored in `data/raw/` and **NOT committed to git**:
- `CTP-EN_CommunitySusceptibilityScores.csv` - Raw susceptibility scores
- `PoR_SuscScores_export_NoAg.csv` - Raw supplementary data

### 2. Preprocessing (Python)
Python scripts normalize column names and calculate derived fields:

```bash
npm run prepare:data
```

This runs:
- `scripts/prepare_cd_metrics.py` - Processes metrics, adds `Province_Name`, `Top_Score_Normalized`, `Top_Metrics`
- `scripts/prepare_cd_supplementary.py` - Processes NAICS sector data

**Output**: `static/data/*.csv` files with normalized column names (**committed to git**)

### 3. Build-Time Conversion (JavaScript)
During build, CSV files are converted to JSON:

```bash
npm run build:data
```

This runs:
- `scripts/csv-to-json.js` - Converts CSV to JSON for faster loading

**Output**: `static/data/*.json` files (**NOT committed**, regenerated each build)

### 4. Deployment
GitHub Actions runs:
```bash
npm ci
npm run build  # Includes build:data step
```

## When to Run Each Step

### Update Raw Data
When you have new raw data files:
```bash
# 1. Place new files in data/raw/
# 2. Run preprocessing
npm run prepare:data
# 3. Commit the processed CSV files
git add static/data/*.csv
git commit -m "Update processed data"
```

### Development
Just run the dev server - CSV files are already processed:
```bash
npm run dev
```

### Deployment
Push to master - GitHub Actions handles the build:
```bash
git push origin master
```

## File Flow

```
data/raw/*.csv (not in git)
    ↓ npm run prepare:data
static/data/*.csv (in git)
    ↓ npm run build:data
static/data/*.json (not in git, build artifact)
    ↓ npm run build
build/ (deployed to GitHub Pages)
```

## Important Notes

1. **Raw data is NOT in git** - too large, source of truth is elsewhere
2. **Processed CSV files ARE in git** - ready for development
3. **JSON files are NOT in git** - regenerated each build
4. **Only run `prepare:data` when raw data changes**
5. **Always commit processed CSV after running `prepare:data`**

## Column Name Mapping

The preprocessing step normalizes these column names:

| Raw CSV Column | Normalized Column |
|----------------|-------------------|
| `CD UID` | `GeoUID` |
| `CD name` | `CD_Name` |
| `Province or Territory` | `Province` |
| `Top Score` | `Top_Score` |
| `IS score` | `IS_score` |
| `MS score` | `MS_score` |
| `FS score` | `FS_score` |

Additional calculated fields:
- `Province_Name` - Full province name from code
- `Top_Score_Normalized` - Normalized top score (0-1)
- `Top_Metrics` - Which metrics equal top score (e.g., "IS+MS")
