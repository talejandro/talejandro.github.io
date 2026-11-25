// src/foundation/disclosure/disclosure.ts
import {
  bindFindable,
  bindPanel,
  hiddenAttrs,
  supportsHiddenUntilFound
} from "../motion/panel.js";
import { openAttrs } from "../kernel/attrs.js";
function createPendingReason(none) {
  let reason = none;
  let askedAt = 0;
  return {
    set(next) {
      reason = next;
      askedAt = Date.now();
    },
    // The reason for the value that just arrived, once.
    take() {
      const taken = Date.now() - askedAt < 100 ? reason : none;
      reason = none;
      return taken;
    }
  };
}
function bindTriggerElement(el) {
  if (el.tagName === "BUTTON") {
    return;
  }
  if (!el.hasAttribute("role")) {
    el.setAttribute("role", "button");
  }
  if (!el.matches("a[href]") && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "0");
  }
}
function triggerKeydown(event, el) {
  if (!el || el.tagName === "BUTTON" || event.target !== el) {
    return;
  }
  if (el.matches("a[href]") && (event.key !== " " || el.getAttribute("role") !== "button")) {
    return;
  }
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  event.preventDefault();
  el.click();
}
function focusPressedTrigger(el) {
  if (el && typeof document !== "undefined" && document.activeElement !== el) {
    el.focus({ preventScroll: true });
  }
}
export {
  bindFindable,
  bindPanel,
  bindTriggerElement,
  createPendingReason,
  focusPressedTrigger,
  hiddenAttrs,
  openAttrs,
  supportsHiddenUntilFound,
  triggerKeydown
};
