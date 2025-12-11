export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "ctp-susceptibility-map/_app",
	assets: new Set([".nojekyll","data/cd_metrics.csv","data/cd_metrics.json","data/cd_metrics.TEMPLATE_EXAMPLE.csv","data/cd_supplementary.csv","data/cd_supplementary.json","data/census_divisions.geojson"]),
	mimeTypes: {".csv":"text/csv",".json":"application/json",".geojson":"application/geo+json"},
	_: {
		client: {start:"_app/immutable/entry/start.D4eAbCvX.js",app:"_app/immutable/entry/app.D9AcNzrj.js",imports:["_app/immutable/entry/start.D4eAbCvX.js","_app/immutable/chunks/CPoLSM5d.js","_app/immutable/chunks/CHBTWv7X.js","_app/immutable/chunks/8ta8izln.js","_app/immutable/chunks/CC2u4hl0.js","_app/immutable/entry/app.D9AcNzrj.js","_app/immutable/chunks/CPoLSM5d.js","_app/immutable/chunks/DUT5qIg2.js","_app/immutable/chunks/k8Y-qLYE.js","_app/immutable/chunks/BxAWzybd.js","_app/immutable/chunks/CHBTWv7X.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/embed",
				pattern: /^\/embed\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/two-column",
				pattern: /^\/two-column\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/two-row",
				pattern: /^\/two-row\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
