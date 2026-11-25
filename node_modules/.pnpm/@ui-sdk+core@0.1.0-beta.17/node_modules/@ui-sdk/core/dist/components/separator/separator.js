// src/components/separator/separator.ts
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function settings(options) {
  const orientation = options.orientation === "vertical" ? "vertical" : "horizontal";
  return { orientation, decorative: !!options.decorative };
}
var separatorPrimitive = /* @__PURE__ */ definePrimitive({
  name: "separator",
  options: { orientation: "string", decorative: "boolean" },
  state: settings,
  sync: settings,
  api: () => ({}),
  slots: (slot) => ({
    root: slot({
      // A separator is structure, so it's never focusable. One that resizes
      // panels is a splitter, which needs a value and is another part.
      role: (state) => state.decorative ? "none" : "separator",
      roles: ["none", "separator"],
      state: (state) => ({ orientation: state.orientation }),
      attrs: (state) => ({
        "aria-orientation": state.decorative ? void 0 : state.orientation,
        "data-orientation": state.orientation
      })
    })
  }),
  // Agents never list it: it has nothing to read or change.
  agent: { shown: () => false }
});
var separator = separatorPrimitive;
export {
  separator
};
