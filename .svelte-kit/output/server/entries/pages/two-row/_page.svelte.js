import { b as bind_props } from "../../../chunks/index.js";
import { M as MapPage } from "../../../chunks/MapPage.js";
import { a as config2Row } from "../../../chunks/testConfigs.js";
function _page($$renderer, $$props) {
  let data = $$props["data"];
  MapPage($$renderer, { data, config: config2Row });
  bind_props($$props, { data });
}
export {
  _page as default
};
