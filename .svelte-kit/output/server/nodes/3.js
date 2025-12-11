import * as server from '../entries/pages/two-column/_page.server.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/two-column/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/two-column/+page.server.js";
export const imports = ["_app/immutable/nodes/3._lTQOaiu.js","_app/immutable/chunks/3TGghoft.js","_app/immutable/chunks/DnLhgM-Q.js","_app/immutable/chunks/CRGCaXa7.js","_app/immutable/chunks/BowW3htO.js","_app/immutable/chunks/CKX27AQ1.js","_app/immutable/chunks/BVpqM4UI.js","_app/immutable/chunks/BySWQMM0.js","_app/immutable/chunks/Cuxx5man.js","_app/immutable/chunks/DoxpZ71T.js"];
export const stylesheets = ["_app/immutable/assets/MapPage.BeQumkXn.css"];
export const fonts = [];
