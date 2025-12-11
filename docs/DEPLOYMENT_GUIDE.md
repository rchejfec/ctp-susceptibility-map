# Deployment Guide

This guide covers deploying the CTP Susceptibility Map for production use with iframe embedding.

## Prerequisites

- Node.js 18+ installed locally
- GitHub account (for Actions CI/CD)
- Access to hosting platform (Vercel, Netlify, or your own server)

## Local Build & Test

### Build the Application

```bash
npm run build
```

This creates a production build in the `build/` directory.

### Preview Locally

```bash
npm run preview
```

Visit http://localhost:4173 to test the built application.

## Deployment Options

### Option 1: Vercel (Recommended for SvelteKit)

**Advantages:**
- Zero-config deployment
- Automatic preview deployments
- Global CDN
- Free tier available
- Supports Node.js adapter

**Steps:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts to connect GitHub and configure

4. Get deployment URL: `https://your-project.vercel.app`

5. Update GitHub secrets for CI/CD (optional):
   - `VERCEL_TOKEN` - From Vercel account settings
   - `VERCEL_ORG_ID` - From Vercel team/account
   - `VERCEL_PROJECT_ID` - Shown after first deployment

### Option 2: Netlify

**Advantages:**
- GitHub integration
- Automatic deployments on push
- Edge functions available

**Steps:**

1. Push code to GitHub

2. Connect at https://app.netlify.com:
   - Click "New site from Git"
   - Select repository
   - Build command: `npm run build`
   - Publish directory: `build`

3. Deploy automatically on each push

### Option 3: Self-Hosted (Node.js Server)

**Advantages:**
- Full control
- No vendor lock-in
- Can customize deployment

**With Docker:**

```bash
# Build image
docker build -t ctp-map .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  ctp-map
```

**Without Docker:**

```bash
npm run build
npm install --production  # Production deps only
node build
```

**Environment Variables:**

Create `.env`:
```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
```

### Option 4: AWS (ECS, Lambda, or EC2)

**Using ECS with Docker:**

1. Build and push Docker image to ECR
2. Create ECS task definition with image
3. Create ECS service
4. Configure ALB with HTTPS

**Using Lambda + API Gateway:**

Note: Lambda doesn't support Node.js adapter directly. Use:
- Switch to `@sveltejs/adapter-aws-lambda` or
- Use Lambda with pre-built `build/` as static files

## iframe Embedding

Once deployed, embed in WordPress or HTML:

```html
<!-- Basic iframe -->
<iframe 
  src="https://your-deployed-url.com"
  width="100%"
  height="800"
  frameborder="0"
  allow="geolocation"
  title="CTP Susceptibility Map">
</iframe>
```

### CORS Requirements

If embedding cross-domain, ensure CORS headers are set:

**Vercel:** Automatically allows iframe embedding

**Netlify:** Automatically allows iframe embedding

**Self-hosted:** Add to `svelte.config.js`:

```javascript
const config = {
  kit: {
    adapter: adapter(),
    cors: {
      origin: ['yourdomain.com', 'anotherdomain.com'],
      credentials: true
    }
  }
};
```

Or use middleware to set headers:

```javascript
// In +layout.server.js or hooks.server.js
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  return response;
}
```

## Monitoring & Maintenance

### Health Checks

**Vercel:** Automatic health checks included

**Self-hosted:** Configure periodic HTTP GET to `/`

### Logs

**Vercel:** View in dashboard → Deployments → Function logs

**Netlify:** View in dashboard → Deploys → Deploy log

**Docker:** 
```bash
docker logs <container-id>
```

**Node.js process:**
```bash
npm install -g pm2
pm2 start build/index.js --name ctp-map
pm2 logs ctp-map
```

## Continuous Deployment (CI/CD)

The repository includes GitHub Actions workflows in `.github/workflows/`:

### Build Workflow

Runs on every push:
1. Install dependencies
2. Run `npm run check`
3. Build application
4. Upload artifacts

### Deploy Workflow

Runs on push to `master` branch:
1. Build application
2. Deploy to Vercel (optional)
3. Build and cache Docker image (optional)

**To enable:**

1. Create `.github/secrets` in repository settings:
   - `VERCEL_TOKEN` - From Vercel
   - `VERCEL_ORG_ID` - From Vercel
   - `VERCEL_PROJECT_ID` - From Vercel

2. GitHub will auto-deploy on push to master

## Environment Variables

### Required for SvelteKit

```
NODE_ENV=production    # Enable production optimizations
```

### Optional

```
VITE_APP_TITLE=CTP Susceptibility Map
VITE_APP_SUBTITLE=Community Transition Pathways
VITE_ALLOWED_ORIGINS=https://yourdomain.com
```

These are prefixed with `VITE_` to be available on client.

## Performance Tips

### Data Caching

For large GeoJSON files:

1. **Static hosting:** Use Vercel or Netlify CDN
2. **Self-hosted:** Add caching headers:

```javascript
// In hooks.server.js
export async function handle({ event, resolve }) {
  if (event.url.pathname.startsWith('/data/')) {
    const response = await resolve(event);
    response.headers.set('Cache-Control', 'public, max-age=31536000');
    return response;
  }
  return resolve(event);
}
```

### MapLibre GL Optimization

- Use vector tiles instead of GeoJSON for large datasets
- Enable feature state for efficient highlighting
- Consider WebGL rendering for 1000+ regions

## Troubleshooting

### Build fails

```bash
npm run check  # Check for TypeScript errors
npm run build  # Detailed build output
```

### Port already in use

```bash
# Find and kill process on port 3000
npx kill-port 3000
```

### CORS errors in iframe

Ensure origin is in CORS whitelist. Check browser console for specific error.

### Map not rendering

1. Check `/data/census_divisions.geojson` is accessible
2. Verify MapLibre GL version in package.json
3. Check browser console for errors

### Data not loading

1. Verify CSV files are in `static/data/`
2. Check file paths match config
3. Verify IDs match between GeoJSON and CSV

## Rollback

### Vercel/Netlify

1. Go to deployments
2. Select previous deployment
3. Click "Redeploy"

### Self-hosted with PM2

```bash
pm2 restart ctp-map
```

### Self-hosted with Docker

```bash
docker run -p 3000:3000 ctp-map:previous-tag
```

## Support

For issues:
1. Check [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
2. Review [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
3. Check browser console (F12) for errors
4. Review application logs

## Next Steps

1. **Choose hosting:** Vercel recommended for ease
2. **Test locally:** `npm run build && npm run preview`
3. **Deploy:** Follow option above
4. **Monitor:** Check health and logs regularly
5. **Update:** Push to GitHub for automatic redeployment
