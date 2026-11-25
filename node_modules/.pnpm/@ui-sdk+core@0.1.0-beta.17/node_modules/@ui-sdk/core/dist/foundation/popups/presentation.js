// src/foundation/popups/presentation.ts
import { on } from "../kernel/events.js";
import { sourceOf } from "../kernel/modality.js";
import { isBrowser } from "../platform/env.js";
import { registerPopupElement } from "./popup-elements.js";
var loading;
var load = () => loading ??= import("./sheet-presentation.js");
var matches = (query) => isBrowser && matchMedia(query).matches;
function createPresentation(store, layer, setting, fallback, dismissal) {
  const resolve = () => {
    const value2 = setting();
    const phone = value2 === "auto" && matches("(max-width: 640px) and (pointer: coarse)");
    return value2 === "sheet" || phone ? "sheet" : fallback;
  };
  const open = () => store.set({ presentation: resolve() });
  const value = setting();
  if (value === "sheet") {
    open();
  }
  if (isBrowser && !loading && (value === "sheet" || value === "auto" && matches("(pointer: coarse)"))) {
    ;
    (window.requestIdleCallback ?? setTimeout)(
      () => load().then((sheet) => sheet.prepareVariables())
    );
  }
  return {
    open,
    /** How it would present if it opened now. */
    resolve,
    bind(el, config) {
      const popup = layer();
      if (setting() === "auto" && popup.opener() === "initial" && store.get().open) {
        queueMicrotask(open);
      }
      if (store.get().presentation !== "sheet") {
        return popup.bind(el, config);
      }
      let cleanup;
      let cancelled = false;
      const hide = () => el.hidden || (el.hidden = true);
      const hidden = new MutationObserver(hide);
      const show = (present) => {
        hidden.disconnect();
        if (!cancelled) {
          cleanup = present();
        }
      };
      load().then(
        ({ presentSheet }) => show(
          () => presentSheet(el, popup, { ...dismissal?.sheet, ...config })
        ),
        () => show(() => popup.bind(el, config))
      );
      hide();
      hidden.observe(el, { attributeFilter: ["hidden"] });
      const unregister = registerPopupElement(el);
      return () => {
        cancelled = true;
        hidden.disconnect();
        unregister();
        cleanup?.();
      };
    }
  };
}
var sheetModal = (presentation, setting, fallback) => setting ?? (presentation === "sheet" ? true : fallback);
var sheetSnapPoints = [0.5, 1];
function bindSheetInput(el, link) {
  const { store } = link;
  if (held.get(store) && store.get().presentation === "sheet" && sourceOf() !== "touch") {
    queueMicrotask(() => el.isConnected && el.focus({ preventScroll: true }));
  }
  held.delete(store);
  const offs = [
    on(
      el,
      "touchend",
      (event) => {
        if (store.get().open || !event.cancelable || link.presentation.resolve() !== "sheet") {
          return;
        }
        event.preventDefault();
        link.open(event);
      },
      { passive: false }
    ),
    on(el, "focus", () => held.set(store, true)),
    on(el, "blur", (event) => event.relatedTarget && held.set(store, false))
  ];
  return () => {
    offs.forEach((off) => off());
    if (el.ownerDocument.activeElement === el) {
      held.set(store, true);
    }
  };
}
var held = /* @__PURE__ */ new WeakMap();
export {
  bindSheetInput,
  createPresentation,
  sheetModal,
  sheetSnapPoints
};
