import * as server from '../entries/pages/_page.server.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.js";
export const imports = ["_app/immutable/nodes/3.BHYGz6Zl.js","_app/immutable/chunks/k8Y-qLYE.js","_app/immutable/chunks/CPoLSM5d.js","_app/immutable/chunks/DTAVCS48.js","_app/immutable/chunks/BxAWzybd.js","_app/immutable/chunks/CHBTWv7X.js","_app/immutable/chunks/CobtZ-hx.js","_app/immutable/chunks/DUT5qIg2.js","_app/immutable/chunks/C7-4sB1g.js","_app/immutable/chunks/BsLJnBQR.js","_app/immutable/chunks/CC2u4hl0.js"];
export const stylesheets = ["_app/immutable/assets/ScatterPlot.BO3dlgC7.css","_app/immutable/assets/MapPage.CAFxA2C-.css"];
export const fonts = [];
