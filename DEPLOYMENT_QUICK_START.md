# Quick Start: Deploy to Vercel

**Time:** 5 minutes

## 1. Install Vercel CLI

```bash
npm install -g vercel
```

## 2. Deploy

```bash
# From project directory
vercel
```

Follow prompts:
- Link to GitHub repo? **Yes** (for auto-deploys)
- Project name: `ctp-susceptibility-map`
- Framework: Detects **SvelteKit** ✓
- Root directory: `.`
- Build command: Detects correctly ✓
- Output directory: Detects `build` ✓

## 3. Get Your URL

After deployment completes:
```
✓ Deployed to https://ctp-susceptibility-map.vercel.app
```

## 4. Embed in iframe

```html
<iframe 
  src="https://ctp-susceptibility-map.vercel.app"
  width="100%"
  height="800"
  frameborder="0"
  title="CTP Susceptibility Map">
</iframe>
```

## 5. Automatic Updates

- Any push to `master` branch → auto-deploys
- Branches get preview URLs
- Rollback via Vercel dashboard

## Alternative: Netlify

```bash
# 1. Push to GitHub
git push

# 2. Go to https://app.netlify.com
# 3. Click "New site from Git"
# 4. Select this repo
# 5. Build settings auto-detected
# 6. Deploy!
```

## Full Guide

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for:
- Self-hosted options
- Docker deployment
- CORS configuration
- Performance optimization
- CI/CD setup
