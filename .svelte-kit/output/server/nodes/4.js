import * as server from '../entries/pages/embed/_page.server.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/embed/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/embed/+page.server.js";
export const imports = ["_app/immutable/nodes/4.CfvX9C0f.js","_app/immutable/chunks/k8Y-qLYE.js","_app/immutable/chunks/CPoLSM5d.js","_app/immutable/chunks/DTAVCS48.js","_app/immutable/chunks/BsLJnBQR.js","_app/immutable/chunks/BxAWzybd.js","_app/immutable/chunks/CHBTWv7X.js","_app/immutable/chunks/DUT5qIg2.js","_app/immutable/chunks/C7-4sB1g.js","_app/immutable/chunks/CC2u4hl0.js"];
export const stylesheets = ["_app/immutable/assets/ScatterPlot.BO3dlgC7.css","_app/immutable/assets/4.CCrigLOB.css"];
export const fonts = [];
