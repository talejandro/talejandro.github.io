// src/components/carousel/carousel-keyboard.ts
import { stepPage } from "./carousel-layout.js";
import { stepFor } from "../../foundation/focus/collection.js";
import { elements } from "../../foundation/kernel/elements.js";
var keepsArrows = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="spinbutton"], [role="listbox"], [role="grid"], [role="tablist"], [role="menu"], [role="menubar"], [role="radiogroup"], [role="tree"], [role="toolbar"]';
function carouselKeys(context, go, readDirection) {
  const { store } = context;
  return function onViewportKeyDown(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const target = event.target;
    if (target.closest(keepsArrows)) {
      return;
    }
    const { page, orientation, loop, pageCount: count } = store.get();
    const step = stepFor(event.key, orientation, readDirection());
    if (step === void 0 || count === null) {
      return;
    }
    event.preventDefault();
    const next = step === "first" ? 1 : step === "last" ? count : stepPage(page, step === 1 ? 1 : -1, count, loop);
    const slide = elements(context, "item").find(
      ({ el: el2 }) => el2.contains(target)
    );
    const by = step === 1 || step === -1 ? step : void 0;
    if (!go(next, "list-navigation", event, by) || !slide) {
      return;
    }
    const first = store.get().pages[store.get().page - 1]?.[0];
    if (!first || first === slide.key) {
      return;
    }
    const el = context.element("item", first);
    if (!el) {
      return;
    }
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
    }
    store.set({ focused: first });
    el.focus({ preventScroll: true });
  };
}
export {
  carouselKeys
};
