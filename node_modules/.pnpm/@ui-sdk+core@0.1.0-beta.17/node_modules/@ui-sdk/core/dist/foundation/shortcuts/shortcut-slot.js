// src/foundation/shortcuts/shortcut-slot.ts
import { formatShortcut, isApple } from "../platform/platform.js";
import { elements } from "../kernel/elements.js";
import {
  shortcuts
} from "./shortcuts.js";
function shortcutText(shortcut, apple) {
  return shortcut ? formatShortcut(shortcut, apple) : "";
}
function adoptPlatform(store) {
  queueMicrotask(
    () => store.get().apple !== isApple() && store.set({ apple: isApple() })
  );
}
function bindPartShortcut(keys, handler, options, onProps) {
  let current;
  let off;
  const update = () => {
    const next = keys() || void 0;
    if (next === current) {
      return;
    }
    off?.();
    current = next;
    off = next ? shortcuts.register(next, handler, options) : void 0;
  };
  update();
  const unwatch = onProps(update);
  return () => {
    unwatch();
    off?.();
  };
}
function shortcutOf(context, slot, el, { beside = false } = {}) {
  const owner = elements(context, slot).find(
    (entry) => entry.el.contains(el) || beside && !!el.parentElement?.contains(entry.el)
  );
  return owner?.props?.shortcut;
}
function shortcutSlot(slot, inherited) {
  return slot({
    props: { shortcut: "string" },
    state: (state, { props, api }) => ({
      text: shortcutText(props.shortcut ?? inherited(state, api), state.apple)
    }),
    attrs: () => ({ "aria-hidden": "true", translate: "no" }),
    bind(el, { store, api, props }) {
      adoptPlatform(store);
      if (el.childNodes.length) {
        return;
      }
      const write = () => {
        const state = store.get();
        el.textContent = shortcutText(
          props.shortcut ?? inherited(state, api, el),
          state.apple
        );
      };
      write();
      const off = store.subscribe(write);
      return () => {
        off();
        el.textContent = "";
      };
    }
  });
}
export {
  adoptPlatform,
  bindPartShortcut,
  shortcutOf,
  shortcutSlot
};
