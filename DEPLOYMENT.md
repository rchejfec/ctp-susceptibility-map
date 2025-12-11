# Deployment Guide

## Overview

This project is configured for deployment to GitHub Pages using GitHub Actions.

## Deployment URLs

- **Main App**: `https://[username].github.io/ctp-susceptibility-map/`
- **Embed Version** (for iframes): `https://[username].github.io/ctp-susceptibility-map/embed`

## Recent Fixes (Dec 11, 2024)

### 1. Static Site Configuration
- ✅ Added `.nojekyll` file to build output to prevent Jekyll processing
- ✅ Configured SvelteKit adapter-static with proper fallback
- ✅ Set base path to `/ctp-susceptibility-map` for GitHub Pages

### 2. Performance Optimization
- ✅ **20MB GeoJSON file now loads client-side** instead of server-side
  - Previous: GeoJSON was loaded during SSR, bloating the initial HTML
  - Now: GeoJSON loads asynchronously on the client with a loading indicator
  - Benefits: Faster initial page load, better user experience

### 3. Removed Legacy Code
- ✅ Cleaned up unused `data.geometry` reference in mapConfig.js
- ✅ Added clear documentation about data loading strategy

### 4. Iframe Embedding Support
- ✅ Created dedicated `/embed` route for iframe embedding
- ✅ Embed version has no header/title for clean embedding
- ✅ Proper layout adjustments for iframe display

## How to Deploy

### Automatic Deployment (GitHub Actions)

Every push to `master` or `main` branch triggers automatic deployment:

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin master
   ```

2. GitHub Actions will:
   - Install dependencies
   - Convert CSV data to JSON
   - Build the static site
   - Deploy to GitHub Pages

### Manual Deployment

To build locally and test:

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

The build output is in the `build/` directory.

## Embedding the Map

Use the `/embed` route for iframe embedding:

```html
<iframe
  src="https://[username].github.io/ctp-susceptibility-map/embed"
  width="100%"
  height="600"
  frameborder="0"
  style="border:0"
  allowfullscreen
></iframe>
```

### Embed vs Main Route

- **Main Route** (`/`): Full page with header, title, and subtitle
- **Embed Route** (`/embed`): Clean version without header for iframe use

## Data Loading Strategy

### Client-Side Loading (Current)
- GeoJSON (20MB) loads client-side with fetch API
- Shows "Loading map data..." indicator during fetch
- Metrics and supplementary data still load server-side (small files)

### Why This Approach?
1. **Faster initial load**: HTML payload is small
2. **Better UX**: Progressive loading with feedback
3. **GitHub Pages friendly**: Avoids large static HTML files

## Troubleshooting

### 404 Errors on GitHub Pages
- Ensure `.nojekyll` file exists in build output (auto-created during build)
- Check that base path matches your repository name in `svelte.config.js`
- Verify GitHub Pages is enabled in repository settings

### Map Not Loading
- Check browser console for CORS errors
- Verify data files exist in `build/data/` directory
- Ensure paths start with base path (`/ctp-susceptibility-map/data/...`)

### Slow Loading
- 20MB GeoJSON file takes time to download
- Consider using a CDN for production
- Future optimization: compress GeoJSON or use vector tiles

## Build Output Structure

```
build/
├── .nojekyll              # Prevents Jekyll processing
├── index.html             # SPA entry point (serves all routes)
├── data/
│   ├── census_divisions.geojson  # 20MB geography data
│   ├── cd_metrics.json           # Metrics data
│   └── cd_supplementary.json     # Supplementary data
└── _app/
    └── immutable/         # SvelteKit app bundles
```

## GitHub Actions Workflow

See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for the complete deployment configuration.

Key steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies (`npm ci`)
4. Build project (`npm run build`)
5. Upload build artifact to GitHub Pages
6. Deploy to GitHub Pages

## Repository Settings

Ensure your GitHub repository has:
- **Settings > Pages > Source**: "GitHub Actions" (not "Deploy from branch")
- **Permissions**: Write access for `GITHUB_TOKEN` to deploy pages

## Base Path Configuration

The base path is set in [`svelte.config.js`](svelte.config.js):

```javascript
paths: {
  base: '/ctp-susceptibility-map'
}
```

Change this if your repository name differs.
