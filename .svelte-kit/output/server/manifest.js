export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["data/cd_metrics.csv","data/cd_metrics.json","data/cd_metrics.TEMPLATE_EXAMPLE.csv","data/cd_supplementary.csv","data/cd_supplementary.json","data/census_divisions.geojson"]),
	mimeTypes: {".csv":"text/csv",".json":"application/json",".geojson":"application/geo+json"},
	_: {
		client: {start:"_app/immutable/entry/start.CPdVMZqL.js",app:"_app/immutable/entry/app.DWxUB1LM.js",imports:["_app/immutable/entry/start.CPdVMZqL.js","_app/immutable/chunks/B3aFC_bH.js","_app/immutable/chunks/DnLhgM-Q.js","_app/immutable/chunks/CKX27AQ1.js","_app/immutable/entry/app.DWxUB1LM.js","_app/immutable/chunks/DnLhgM-Q.js","_app/immutable/chunks/BySWQMM0.js","_app/immutable/chunks/3TGghoft.js","_app/immutable/chunks/CKX27AQ1.js","_app/immutable/chunks/BowW3htO.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/two-column",
				pattern: /^\/two-column\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/two-row",
				pattern: /^\/two-row\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
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
