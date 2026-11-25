// src/components/toast/toast-dom.ts
import { on } from "../../foundation/kernel/events.js";
import { writeStyle } from "../../foundation/platform/style.js";
var defaults = `@layer ui-sdk {
:where([data-slot="toast-region"]) { position: fixed; z-index: 2147483000; display: flex; flex-direction: column; max-width: 100vw }
:where([data-slot="toast-region"][data-side="bottom"]) { bottom: calc(var(--keyboard-inset, 0px) + env(safe-area-inset-bottom, 0px)) }
:where([data-slot="toast-region"][data-side="top"]) { top: env(safe-area-inset-top, 0px) }
:where([data-slot="toast-region"][data-align="start"]) { inset-inline-start: env(safe-area-inset-left, 0px) }
:where([data-slot="toast-region"][data-align="end"]) { inset-inline-end: env(safe-area-inset-right, 0px) }
:where([data-slot="toast-region"][data-align="center"]) { left: 50%; translate: -50% 0 }
:where([data-slot="toast-list"]) { margin: 0; padding: 0; list-style: none }
}`;
function addToastStyles(doc) {
  writeStyle(doc, "ui-sdk-toast-defaults", defaults);
}
function swipeDirections(side, align, rtl) {
  const directions = [side === "top" ? "up" : "down"];
  if (align === "end") {
    directions.push(rtl ? "left" : "right");
  }
  if (align === "start") {
    directions.push(rtl ? "right" : "left");
  }
  return directions;
}
function stackLayout(toasts, heights) {
  let offset = 0;
  let total = 0;
  const layout = /* @__PURE__ */ new Map();
  for (const toast of toasts) {
    if (toast.leaving) {
      continue;
    }
    layout.set(toast.id, { index: toast.index, offset });
    const height = heights.get(toast.id) ?? 0;
    offset += height;
    total += height;
  }
  const front = toasts.find((toast) => !toast.leaving);
  return { layout, total, front: front ? heights.get(front.id) : 0 };
}
function naturalHeight(el) {
  const { style } = el;
  const value = style.getPropertyValue("height");
  const priority = style.getPropertyPriority("height");
  style.setProperty("height", "auto", "important");
  const css = getComputedStyle(el);
  let height = parseFloat(css.height);
  if (css.boxSizing !== "border-box") {
    for (const side of ["Top", "Bottom"]) {
      height += parseFloat(css[`padding${side}`]) + parseFloat(css[`border${side}Width`]);
    }
  }
  style.setProperty("height", value, priority);
  getComputedStyle(el).height;
  return height;
}
function writeHeight(el, name, height) {
  if (Number.isNaN(height)) {
    el.style.removeProperty(name);
  } else {
    el.style.setProperty(name, `${height}px`);
  }
}
function focusAfterClose(toasts, closing, fallback) {
  const index = toasts.indexOf(closing);
  const rest = toasts.filter((toast) => toast !== closing);
  if (!rest.length) {
    return fallback;
  }
  return rest[Math.min(Math.max(index, 0), rest.length - 1)];
}
function pressedText(event) {
  const doc = event.target?.ownerDocument;
  if (!doc) {
    return false;
  }
  const { clientX: x, clientY: y } = event;
  const caret = doc.caretPositionFromPoint?.(x, y);
  const node = caret ? caret.offsetNode : doc.caretRangeFromPoint?.(x, y)?.startContainer;
  if (node?.nodeType !== Node.TEXT_NODE) {
    return false;
  }
  for (let el = node.parentElement; el; el = el.parentElement) {
    const { userSelect, webkitUserSelect } = getComputedStyle(el);
    const value = userSelect || webkitUserSelect;
    if (value === "none") {
      return false;
    }
    if (value && value !== "auto") {
      break;
    }
  }
  const range = doc.createRange();
  range.selectNodeContents(node);
  return Array.from(range.getClientRects()).some(
    (rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
}
function watchAttention(el, report) {
  const doc = el.ownerDocument;
  const view = doc.defaultView ?? window;
  const onVisibility = () => report.away("page-hide", doc.visibilityState === "hidden");
  const offs = [
    on(
      el,
      "pointerenter",
      (event) => event.pointerType !== "touch" && report.hover(true)
    ),
    on(
      el,
      "pointerleave",
      (event) => event.pointerType !== "touch" && report.hover(false)
    ),
    on(el, "focusin", (event) => {
      const from = event.relatedTarget;
      report.focus(true, from && !el.contains(from) ? from : void 0);
    }),
    on(el, "focusout", (event) => {
      const to = event.relatedTarget;
      if (to) {
        return void (!el.contains(to) && report.focus(false));
      }
      queueMicrotask(
        () => (!doc.hasFocus() || !el.contains(doc.activeElement)) && report.focus(false)
      );
    }),
    on(
      view,
      "blur",
      () => setTimeout(
        () => doc.activeElement?.tagName !== "IFRAME" && report.away("window-blur", true)
      )
    ),
    on(view, "focus", () => report.away("window-blur", false))
  ];
  doc.addEventListener("visibilitychange", onVisibility);
  if (doc.visibilityState === "hidden") {
    report.away("page-hide", true);
  }
  return () => {
    offs.forEach((off) => off());
    doc.removeEventListener("visibilitychange", onVisibility);
  };
}
export {
  addToastStyles,
  focusAfterClose,
  naturalHeight,
  pressedText,
  stackLayout,
  swipeDirections,
  watchAttention,
  writeHeight
};
