import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
kit: {
adapter: adapter({
fallback: undefined,  // Remove SPA fallback - we're prerendering
strict: false
}),
prerender: {
entries: ['/', '/embed', '/two-column'],  // Explicitly prerender these routes
handleHttpError: 'warn'
},
paths: {
base: '/ctp-susceptibility-map'
}
},
preprocess: vitePreprocess()
};

export default config;
