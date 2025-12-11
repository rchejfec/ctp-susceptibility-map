
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/embed" | "/two-column" | "/two-row";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/embed": Record<string, never>;
			"/two-column": Record<string, never>;
			"/two-row": Record<string, never>
		};
		Pathname(): "/" | "/embed" | "/embed/" | "/two-column" | "/two-column/" | "/two-row" | "/two-row/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/.nojekyll" | "/data/cd_metrics.csv" | "/data/cd_metrics.json" | "/data/cd_metrics.TEMPLATE_EXAMPLE.csv" | "/data/cd_supplementary.csv" | "/data/cd_supplementary.json" | "/data/census_divisions.geojson" | string & {};
	}
}