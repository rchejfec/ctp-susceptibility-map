import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
kit: {
adapter: adapter({
fallback: 'index.html'
}),
prerender: {
crawl: true
},
paths: {
base: '/ctp-susceptibility-map'
}
},
preprocess: vitePreprocess()
};

export default config;
