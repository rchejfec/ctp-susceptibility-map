import { b as bind_props } from "../../chunks/index.js";
import { M as MapPage, m as mapConfig } from "../../chunks/MapPage.js";
function _page($$renderer, $$props) {
  let data = $$props["data"];
  MapPage($$renderer, { data, config: mapConfig });
  bind_props($$props, { data });
}
export {
  _page as default
};
