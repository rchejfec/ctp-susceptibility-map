# Community Transition Pathways - Susceptibility Map 

**Project:** Census Division susceptibility mapping for trade/tariff impacts
**Data:** CTP Community Susceptibility Scores

## Project Status

This is a **deployed instance** of the pb_map_base template, configured for CTP susceptibility data.

## Data Sources

- **Primary Metrics:** `data/raw/CTP-EN_CommunitySusceptibilityScores.csv`
  - Import Susceptibility (IS)
  - Manufacturing Susceptibility (MS)
  - Fossil fuel Susceptibility (FS)
  - Overall Top Score

- **Supplementary Details:** `data/raw/Overview of Canadian census divisions and their scores.csv`
  - Detailed breakdowns by sector/industry
  - Top sources of susceptibility

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Documentation 

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - How to use this template
- [docs/CONFIGURATION_GUIDE.md](./docs/CONFIGURATION_GUIDE.md) - Full configuration reference
- [docs/LAYOUT_SPECIFICATION.md](./docs/LAYOUT_SPECIFICATION.md) - Layout options
- [docs/TESTING_CHECKLIST.md](./docs/TESTING_CHECKLIST.md) - Testing guide

## Notes

- Template example data renamed to `*.TEMPLATE_EXAMPLE.csv` to avoid confusion
- Template documentation moved to `docs/` folder
- Raw data in `data/raw/`
- Processed data will go in `static/data/`
